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
            return this.contract.methods.createZKP(
                x, v, xG).call({ from: this.activeAccount });
        }
        verifyZKP(xG, zkp, vG) {
            if(!this.activeAccount) {
                console.error('No Active account set');
                return;
            }
            return this.contract.methods.verifyZKP(
                xG, zkp, vG).call({ from: this.activeAccount });
        }
        create1outof2ZKPYesVote(xG, yG, w, r, d, x) {
            return this.contract.methods.create1outof2ZKPYesVote(
                xG, yG, w, r, d, x).call({ from: this.activeAccount }
            );
        }
        create1outof2ZKPNoVote(xG, yG, w, r, d, x) {
            return this.contract.methods.create1outof2ZKPNoVote(
                xG, yG, w, r, d, x).call({ from: this.activeAccount }
            );
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
