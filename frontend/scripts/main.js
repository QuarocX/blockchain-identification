(function(){
    window.app = {
        ng: null,
        net: {},
        util: {},
        contracts: null
    };
    window.app.ng = angular.module('votingApp', ['ui.router']);
    let web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.178.6:7545"));
    window.app.ng.constant('web3', web3);

	fetch('/data/manifest.json')
		.then(data => (data.json()))
		.then((contracts) => {
			window.app.contracts = contracts;
		}).then(() => {
			angular.element(() => {
				angular.bootstrap(document, ['votingApp']);
			});
		});
})();
