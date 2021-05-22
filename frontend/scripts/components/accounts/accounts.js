(function(){
    window.app.ng.component('accounts',{
        templateUrl: '/scripts/components/accounts/accounts.html',
        controller: function($scope, $state, web3) {
            let accounts = web3.eth.accounts;
            if (accounts.length == 1) {
                $state.go('root.state', { 'account': accounts[0]})
            }

			$scope.account = '0';
            $scope.accounts = accounts;
			$scope.onSelected = (val) => {
				if (val != 0) {
					$state.go('root.state', { 'account': $scope.account})
				}
			}
        }
    });
})();
