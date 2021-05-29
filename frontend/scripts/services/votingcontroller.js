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
		preRegister() {
			return this.contract.preRegister.sendTransaction({
				from: this.activeAccount
			});
		}
		getPreRegisteredVoterCount() {
			return this.contract.getPreRegisteredVoterCount().toNumber();
		}
        isPreRegistered() {
			return this.contract.isPreRegistered();
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
