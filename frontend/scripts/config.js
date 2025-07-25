(function(){
    window.app.ng.config(($logProvider, $stateProvider,
        $urlRouterProvider, votingControllerProvider,
        anonymousVotingProvider, localCryptoProvider,
        idUnionAuthenticatorProvider) => {

            $logProvider.debugEnabled(true);
            votingControllerProvider.setParams(
                window.app.contracts.VotingController.address,
                '/data/' + window.app.contracts.VotingController.abi);
            anonymousVotingProvider.setParams(
                window.app.contracts.AnonymousVoting.address,
                '/data/' + window.app.contracts.AnonymousVoting.abi);
            localCryptoProvider.setParams(
                window.app.contracts.LocalCrypto.address,
                '/data/' + window.app.contracts.LocalCrypto.abi);
            idUnionAuthenticatorProvider.setParams(
                window.app.contracts.IDUnionAuthenticator.address,
                '/data/' + window.app.contracts.IDUnionAuthenticator.abi);

            $stateProvider.state('root', {
                abstract: true,
                views: {
                    'layout': {
                        template: '<root></root>'
                    }
                },
                resolve: {
                    'authContract': (votingController, anonymousVoting,
                        localCrypto, idUnionAuthenticator) => {
                            return Promise.all([votingController.ready(),
                                anonymousVoting.ready(),
                                localCrypto.ready(),
                                idUnionAuthenticator.ready()]);
                        }
                }
            })
                .state('root.home', {
                    url: '/',
                    template: '<home></home>',
                })
                .state('root.account', {
                    url: '/account',
                    template: '<accounts></accounts>'
                })
                .state('root.state', {
                    url: '/:account',
                    template: '<state></state>'
                })
                .state('root.state.preregister', {
                    url: '/preregister',
                    template: '<preregister></preregister>'
                })
                .state('root.state.vote', {
                    url: '/vote',
                    template: '<vote></vote>'
                })
                .state('root.state.vote.signup', {
                    url: '/signup',
                    template: '<signup></signup>'
                })
                .state('root.state.vote.cast', {
                    url: '/cast',
                    template: '<cast></cast>'
                })
                .state('root.state.vote.result', {
                    url: '/result',
                    template: '<result></result>'
                })
                .state('root.auth', {
                    url: '/auth',
                    template: '<auth></auth>'
                });
            $urlRouterProvider.otherwise('');
        });
})();
