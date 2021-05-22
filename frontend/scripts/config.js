(function(){
    window.app.ng.config(($logProvider, $stateProvider,
        $urlRouterProvider, votingControllerProvider,
        anonymousVotingProvider) => {

        $logProvider.debugEnabled(true);
        votingControllerProvider.setParams(
            window.app.contracts.VotingController.address,
            '/data/' + window.app.contracts.VotingController.abi);
        anonymousVotingProvider.setParams(
            window.app.contracts.AnonymousVoting.address,
            '/data/' + window.app.contracts.AnonymousVoting.abi);

        $stateProvider.state('root', {
            abstract: true,
            views: {
                'layout': {
                    template: '<root></root>'
                }
            },
            resolve: {
                authContract: (votingController, anonymousVoting) => {
                    return Promise.all([votingController.ready(), anonymousVoting.ready()]);
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
        $urlRouterProvider.otherwise('');
    });
})();
