(function(){
    class ContractLoaderService {
        constructor(web3) {
            this.web3 = web3;
        }
        async load(address, abiPath) {
            let result = await fetch(abiPath);
            let abiJson = await result.json();
            let contract = this.web3.eth.contract(abiJson);
            return contract.at(address);
        }
    }
    window.app.ng.factory('contractLoader', (web3) => {
        return new ContractLoaderService(web3);
    });
})();
