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

    /*
    let initiator_ip;
    fetch('/config.json')
        .then(data => data.json())
        .then(json => {
            console.log(json); 
            initiator_ip = json;
            let web3 = new Web3(//Web3.givenProvider ||
                new Web3.providers.WebsocketProvider(`ws://${initiator_ip}:8545`));
        })
    */
    
    let web3 = new Web3(//Web3.givenProvider ||
        new Web3.providers.WebsocketProvider(`ws://${window.location.hostname}:8545`));

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
