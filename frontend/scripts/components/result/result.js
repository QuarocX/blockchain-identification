(function(){
    window.app.ng.component('result',{
        templateUrl: '/scripts/components/result/result.html',
        controller: async function($scope, anonymousVoting) {
            $scope.data = {};
            $scope.data.totalregistered =
                await anonymousVoting.totalregistered(),
            $scope.data.totalvoted = await anonymousVoting.totalvoted(),
            $scope.data.yes = await anonymousVoting.finaltally(0),
            $scope.data.total = await anonymousVoting.finaltally(1)
            $scope.data.no = $scope.data.total - $scope.data.yes;
            $scope.$apply();
        }
    });
})();
