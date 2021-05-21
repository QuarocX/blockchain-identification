(function(){
    window.app = {
        ng: null,
        net: {},
        util: {},
        contracts: {
            'votingController': {
                'abi': '/abis/VotingController.json',
                'address': '0x26745A9439DABCe56531323660591D118FC9560C'
            },
            'authenticator': {
                'abi': '/abis/authenticator.json',
                'address': '0x26'
            },
            'voting': {
                'abi': '/abis/voting.json',
                'address': '0x26'
            }
        }
    };
    window.app.ng = angular.module('votingApp', ['ui.router']);
    let web3 = new Web3(Web3.providers.HttpProvider("ws://localhost:7545"));
    window.app.ng.value('web3', web3);

    angular.element(() => {
        angular.bootstrap(document, ['votingApp']);
    });
})();
