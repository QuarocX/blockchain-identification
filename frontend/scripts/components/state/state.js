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
            $state.go('root.state.vote', null, { location: 'replace' });
        }
    });
})();
