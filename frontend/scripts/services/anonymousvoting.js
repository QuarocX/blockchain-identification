(function(){
    class AnonymousVoting {
        constructor(contractLoader, _address, _abi) {
            this.promise = contractLoader.load(_address, _abi);
            this.promise.then((contract) => {
                this.contract = contract;
            });
            this.activeAccount = null;
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
        depositrequired() {
            return this.contract.depositrequired();
        }
        register(xG, vG, zkp) {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            let deposit = this.depositrequired();
            let verifyRes = this.contract.register.call(xG, vG, zkp, {
                'from': this.activeAccount,
                value: deposit
            });

            if (verifyRes) {
                return this.contract.register.sendTransaction(xG, vG, zkp, {
                    'from': this.activeAccount,
                    value: deposit,
                    gas: 4200000
                });
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

        this.$get = (contractLoader) => {
            return new AnonymousVoting(contractLoader, address, abi);
        }
    });
})();
