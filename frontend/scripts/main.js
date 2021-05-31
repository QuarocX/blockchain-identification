(function(){
    window.app = {
        ng: null,
        net: {},
        util: {},
        contracts: null
    };
    let angular = window.angular;
    let Web3 = window.Web3;
    let app = window.app;

    let web3 = new Web3(//Web3.givenProvider ||
        new Web3.providers.WebsocketProvider("ws://localhost:8545"));

    app.ng = angular.module('votingApp', ['ui.router']);
    app.ng.constant('web3', web3);

    fetch('/data/manifest.json')
        .then(data => (data.json()))
        .then((contracts) => {
            app.contracts = contracts;
        }).then(() => {
            angular.element(() => {
                angular.bootstrap(document, ['votingApp']);
            });
        });
})();
