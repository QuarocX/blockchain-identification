(function(){
    window.app.ng.component('accounts',{
        templateUrl: '/scripts/components/accounts/accounts.html',
        controller: function($scope, $state, web3) {
            $scope.account = '0';
            $scope.onSelected = (val) => {
                if (val != 0) {
                    $state.go('root.state', { 'account': $scope.account})
                }
            }
            web3.eth.getAccounts().then((accounts) => {
                if (accounts.length == 1) {
                    $state.go('root.state', { 'account': accounts[0]})
                }
                $scope.accounts = accounts;
                $scope.$apply();
            });
        }
    });
})();
