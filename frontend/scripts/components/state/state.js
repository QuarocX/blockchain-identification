(function(){
    window.app.ng.component('state',{
        templateUrl: '/scripts/components/state/state.html',
        controller: function($scope, $state, web3, votingController) {
            $scope.account = $state.params.account;
            if (!web3.personal.unlockAccount($state.params.account, ''))
                throw 'Could not unlock account';

            votingController.setActiveAccount($state.params.account);
            // assuming pre-register
            $state.go('root.state.preregister');
        }
    });
})();
