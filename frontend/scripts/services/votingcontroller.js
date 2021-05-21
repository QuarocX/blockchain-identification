(function(){
    class VotingController {
        constructor(contractLoader, _address, _abi) {
            this.promise = contractLoader.load(_address, _abi);
            this.promise.then((contract) => {
                this.contract = contract;
            })
        }
        ready() {
            return this.promise;
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
