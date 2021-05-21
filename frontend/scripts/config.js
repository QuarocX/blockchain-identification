(function(){
    window.app.ng.config(($logProvider, $stateProvider,
        $urlRouterProvider, votingControllerProvider) => {

        votingControllerProvider.setParams(
            window.app.contracts.votingController.address,
            window.app.contracts.votingController.abi);

        $logProvider.debugEnabled(true);
        $stateProvider.state('root', {
            views: {
                'layout': {
                    template: '<root></root>'
                }
            }
        })
        .state('root.home', {
            url: '/',
            template: '<home></home>',
            resolve: {
                authContract: (votingController) => {
                    return votingController.ready();
                }
            }
        })
        .state('root.authed', {
        })
        .state('root.authed.dashboard', {
            url: '/dashboard',
            template: '<dashboard></dashboard>',
        })
        .state('root.authed.exam', {
            abstract: true,
            url: '/exams/:exam_id',
            template: '<exam></exam>'
        })
        .state('root.authed.exam.question', {
            url: '/:question_hash',
            template: '<question></question>'
        });
        $urlRouterProvider.otherwise('');
    });
})();
