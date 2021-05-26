(function(){
    class ContractLoaderService {
        constructor(web3) {
            this.web3 = web3;
        }
        async load(address, abiPath) {
            let result = await fetch(abiPath);
            let abiJson = await result.json();
            return new this.web3.eth.Contract(abiJson, address);
        }
    }
    window.app.ng.factory('contractLoader', (web3) => {
        return new ContractLoaderService(web3);
    });
})();
