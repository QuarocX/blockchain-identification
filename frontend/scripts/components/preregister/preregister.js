(function(){
    window.app.ng.component('preregister',{
        templateUrl: '/scripts/components/preregister/preregister.html',
        controller: function($scope, $state, votingController, notificationsService) {
            if (votingController.isPreRegistered()) {
                $state.go('root.state.vote');
            }
            $scope.preRegister = () => {
                try {
                    votingController.preRegister();
                    notificationsService.success('Succesfully preregistered');
                    $state.go('root.state.vote');
                } catch (e) {
                    notificationsService.error(e.message);
                }
            };
        }
    });
})();
