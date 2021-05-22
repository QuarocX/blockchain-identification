(function(){
    window.app.ng.component('result',{
        templateUrl: '/scripts/components/result/result.html',
        controller: function($scope, $state, anonymousVoting) {
            let data = {
                totalregistered: anonymousVoting.totalregistered(),
                totalvoted: anonymousVoting.totalvoted(),
                yes: anonymousVoting.finaltally(0),
                total: anonymousVoting.finaltally(1)
            };
            data.no = data.total - data.yes;
            console.log(data);
            $scope.data = data;
        }
    });
})();
