(function(){
    window.app.ng.component('state',{
        templateUrl: '/scripts/components/state/state.html',
        controller: function($scope, $state,
        votingController, localCrypto, anonymousVoting) {
            $scope.account = $state.params.account;
            anonymousVoting.question().then((v) => {
                $scope.question = v;
                $scope.$apply();
            });

            votingController.setActiveAccount($state.params.account);
            localCrypto.setActiveAccount($state.params.account);
            anonymousVoting.setActiveAccount($state.params.account);

            votingController.isPreRegistered().then(preRegistered => {
                if (preRegistered) {
                    $state.go('root.state.vote', null, { location: 'replace' });
                } else {
                    $state.go('root.state.preregister', null, { location: 'replace' });
                }
            })
        }
    });
})();
