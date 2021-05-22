(function(){
    class AnonymousVoting {
        constructor(contractLoader, _address, _abi, localCrypto) {
            this.promise = contractLoader.load(_address, _abi);
            this.promise.then((contract) => {
                this.contract = contract;
            });
            this.activeAccount = null;
            this.localCrypto = localCrypto;
        }
        ready() {
            return this.promise;
        }
        setActiveAccount(account) {
            this.activeAccount = account;
        }
        eligible() {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.eligible(this.activeAccount);
        }
        question() {
            return this.contract.question();
        }
        state() {
            return this.contract.state().toNumber();
        }
        endSignupPhase() {
            return this.contract.endSignupPhase() * 1000;
        }
        finishSignupPhase() {
            return this.contract.finishSignupPhase() * 1000;
        }
        endVotingPhase() {
            return this.contract.endVotingPhase() * 1000;
        }
        registered() {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.registered(this.activeAccount);
        }
        totaleligible() {
            return this.contract.totaleligible().toNumber();
        }
        totalregistered() {
            return this.contract.totalregistered().toNumber();
        }
        totalvoted() {
            return this.contract.totalvoted().toNumber();
        }
        depositrequired() {
            return this.contract.depositrequired();
        }
        register(x, xG, v, w, r, d) {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }

            let single_zkp = this.localCrypto.createZKP(x, v, xG);
            let vG = [single_zkp[1], single_zkp[2], single_zkp[3]];
            // Lets make sure the ZKP is valid!
            let verifyres = this.localCrypto.verifyZKP(xG, single_zkp[0], vG);
            if (!verifyres) {
                console.error("Problem with voting codes");
                return false;
            }

            let zkp = single_zkp[0];
            let deposit = this.depositrequired();
            let verifyRes = this.contract.register.call(xG, vG, zkp, {
                'from': this.activeAccount,
                value: deposit
            });
            if (!verifyres) {
                console.error("Problem simulating transaction");
                return false;
            }

            if (this.contract.register.sendTransaction(xG, vG, zkp, {
                'from': this.activeAccount,
                value: deposit,
                gas: 4200000
            })) {
                window.localStorage.setItem(
                    this.activeAccount, JSON.stringify({
                        'w': w.toJSON(),
                        'r': r.toJSON(),
                        'd': d.toJSON(),
                        'x': x.toJSON()
                    }));
                return true;
            }
            return false;
        }
        submitVote(choice) {
            let storedData = window.localStorage.getItem(
                    this.activeAccount);
            if (!storedData) {
                console.error('No stored data found, this is unsupported');
                return false;
            }
            storedData = JSON.parse(storedData);
            let w = new BigNumber(storedData.w);
            let r = new BigNumber(storedData.r);
            let d = new BigNumber(storedData.d);
            let x = new BigNumber(storedData.x);

            let result;
            let voter = this.contract.getVoter.call({
                from: this.activeAccount });
            var xG = [voter[0][0], voter[0][1]];
            var yG = [voter[1][0], voter[1][1]];
            if (choice == 1) {
                result = this.localCrypto.create1outof2ZKPYesVote(
                            xG, yG, w, r, d, x);
            } else {
                result = this.localCrypto.create1outof2ZKPNoVote(
                            xG, yG, w, r, d, x);
            }
            var y = [result[0][0], result[0][1]];
            var a1 = [result[0][2], result[0][3]];
            var b1 = [result[0][4], result[0][5]];
            var a2 = [result[0][6], result[0][7]];
            var b2 = [result[0][8], result[0][9]];

            var params = [result[1][0], result[1][1],
                          result[1][2], result[1][3]];

            result = this.contract.verify1outof2ZKP.call(
                        params, y, a1, b1, a2, b2, {
                            'from': this.activeAccount
                        });
            // Let's make sure the zero knowledge proof checked out...
            if (result) {
                return this.contract.submitVote.sendTransaction(
                    params, y, a1, b1, a2, b2, {
                        'from': this.activeAccount,
                        gas: 4200000
                    }
                );
            }
            return false;
        }
    }

    window.app.ng.provider('anonymousVoting', function() {
        var address, abi;

        this.setParams = (_address, _abi) => {
            address = _address;
            abi = _abi;
        }

        this.$get = (contractLoader, localCrypto) => {
            return new AnonymousVoting(contractLoader, address, abi,
                localCrypto);
        }
    });
})();
