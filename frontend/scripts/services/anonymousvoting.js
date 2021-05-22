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
            return this.contract.registered();
        }
		totaleligible() {
			return this.contract.totaleligible().toNumber();
		}
		totalregistered() {
			return this.contract.totalregistered().toNumber();
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
