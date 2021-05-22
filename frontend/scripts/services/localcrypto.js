(function(){
    class LocalCrypto {
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
        createZKP(x, v, xG) {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.createZKP.call(
                x, v, xG, { from: this.activeAccount });
        }
        verifyZKP(xG, zkp, vG) {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.verifyZKP.call(
                xG, zkp, vG, { from: this.activeAccount });
        }
    }

    window.app.ng.provider('localCrypto', function() {
        var address, abi;

        this.setParams = (_address, _abi) => {
            address = _address;
            abi = _abi;
        }
        
        this.$get = (contractLoader) => {
            return new LocalCrypto(contractLoader, address, abi);
        }
    });
})();
