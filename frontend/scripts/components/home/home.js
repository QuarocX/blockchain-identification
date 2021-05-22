(function(){
    window.app.ng.component('home',{
        templateUrl: '/scripts/components/home/home.html',
        controller: function($scope, $state) {
            $scope.join = () => {
                $state.go('root.account');
            }
        }
    });
})();
