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
        } setActiveAccount(account) {
            this.activeAccount = account;
        }
        eligible() {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.methods.eligible(this.activeAccount).call();
        }
        question() {
            return this.contract.methods.question().call();
        }
        state() {
            return this.contract.methods.state().call()
                .then(parseInt);
        }
        endSignupPhase() {
            return this.contract.methods.endSignupPhase().call()
                .then((res) => parseInt(res) * 1000);
        }
        finishSignupPhase() {
            return this.contract.methods.finishSignupPhase().call()
                .then((res) => parseInt(res) * 1000);
        }
        endVotingPhase() {
            return this.contract.methods.endVotingPhase().call()
                .then((res) => parseInt(res) * 1000);
        }
        registered() {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.methods.registered(this.activeAccount)
                .call();
        }
        totaleligible() {
            return this.contract.methods.totaleligible().call()
                .then(parseInt);
        }
        totalregistered() {
            return this.contract.methods.totalregistered().call()
                .then(parseInt)
        }
        totalvoted() {
            return this.contract.methods.totalvoted().call()
                .then(parseInt);
        }
        depositrequired() {
            return this.contract.methods.depositrequired().call();
        }
        async register(x, xG, v, w, r, d) {
            if(!this.activeAccount) {
                throw 'No active account set';
            }

            let single_zkp = await this.localCrypto.createZKP(x, v, xG);
            let vG = [single_zkp[1], single_zkp[2], single_zkp[3]];
            // Lets make sure the ZKP is valid!
            let verifyres = this.localCrypto.verifyZKP(xG, single_zkp[0], vG);
            if (!verifyres) {
                console.error("Problem with voting codes");
                throw 'Error with voting codes';
            }

            let zkp = single_zkp[0];
            let deposit = await this.depositrequired();
            verifyres = await this.contract.methods.register(xG, vG, zkp)
                .call({
                    'from': this.activeAccount,
                    'value': deposit
            });
            if (!verifyres) {
                console.error("Problem simulating transaction");
                throw 'An error occured while simulating transaction';
            }

            return this.contract.methods.register(xG, vG, zkp).send({
                'from': this.activeAccount,
                'value': deposit,
                'gas': 4200000
            }).then(() => {
                window.localStorage.setItem(
                    this.activeAccount, JSON.stringify({
                        'w': w,
                        'r': r,
                        'd': d,
                        'x': x
                    }));
            }); 
        }
        async submitVote(choice) {
            let storedData = window.localStorage.getItem(
                    this.activeAccount);
            if (!storedData) {
               throw 'No stored data found, this is unsupported';
            }
            storedData = JSON.parse(storedData);
            let w = storedData.w;
            let r = storedData.r;
            let d = storedData.d;
            let x = storedData.x;

            let result;
            let voter = await this.contract.methods.getVoter().call({
                from: this.activeAccount });
            var xG = [voter[0][0], voter[0][1]];
            var yG = [voter[1][0], voter[1][1]];
            if (choice == 1) {
                result = await this.localCrypto.create1outof2ZKPYesVote(
                            xG, yG, w, r, d, x);
            } else {
                result = await this.localCrypto.create1outof2ZKPNoVote(
                            xG, yG, w, r, d, x);
            }
            var y = [result[0][0], result[0][1]];
            var a1 = [result[0][2], result[0][3]];
            var b1 = [result[0][4], result[0][5]];
            var a2 = [result[0][6], result[0][7]];
            var b2 = [result[0][8], result[0][9]];

            var params = [result[1][0], result[1][1],
                          result[1][2], result[1][3]];

            result = this.contract.methods.verify1outof2ZKP(
                        params, y, a1, b1, a2, b2).call({
                            'from': this.activeAccount
                        });
            // Let's make sure the zero knowledge proof checked out...
            if (result) {
                return this.contract.methods.submitVote(
                    params, y, a1, b1, a2, b2).send({
                        'from': this.activeAccount,
                        gas: 4200000
                    }
                );
            }
            throw 'ZKP did not check out';
        }
        finaltally(index) {
            return this.contract.methods.finaltally(index).call()
                .then(parseInt);
        }
        votecast() {
            return this.contract.methods.votecast(this.activeAccount).call()
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
