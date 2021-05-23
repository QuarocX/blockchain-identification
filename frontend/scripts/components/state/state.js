(function(){
    window.app.ng.component('state',{
        templateUrl: '/scripts/components/state/state.html',
        controller: function($scope, $state, web3,
        votingController, localCrypto, anonymousVoting) {
            $scope.account = $state.params.account;
            anonymousVoting.question().then((v) => {
                $scope.question = v;
            });

            votingController.setActiveAccount($state.params.account);
            localCrypto.setActiveAccount($state.params.account);
            anonymousVoting.setActiveAccount($state.params.account);
            // assuming pre-register
            if (!votingController.isPreRegistered()) {
                $state.go('root.state.preregister', null, { location: 'replace' });
            } else {
                $state.go('root.state.vote.signup', null, { location: 'replace' });
            }
        }
    });
})();
