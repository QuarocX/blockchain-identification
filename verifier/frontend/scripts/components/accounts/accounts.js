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
            window.web3 = web3;
            let fetchAccounts = web3.currentProvider.isMetaMask ?
                'requestAccounts': 'getAccounts';
            web3.eth[fetchAccounts]().then((accounts) => {
                if (accounts.length == 1) {
                    $state.go('root.state', { 'account': accounts[0]},
                        { 'location': 'replace' });
                }
                $scope.accounts = accounts;
                $scope.$apply();
            });
        }
    });
})();
