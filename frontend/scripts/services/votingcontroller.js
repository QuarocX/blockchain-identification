(function(){
    class VotingController {
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
		async preRegister() {
			return this.contract.methods.preRegister().send({
				from: this.activeAccount, 
                gas: 4200000
			})
		}
		getPreRegisteredVoterCount() {
			return this.contract.getPreRegisteredVoterCount().toNumber();
		}
        async isPreRegistered() {
            return this.contract.methods.isPreRegistered().call()
        }
    }

    window.app.ng.provider('votingController', function() {
        var address, abi;

        this.setParams = (_address, _abi) => {
            address = _address;
            abi = _abi;
        }
        
        this.$get = (contractLoader) => {
            return new VotingController(contractLoader, address, abi);
        }
    });
})();
