(function(){
    window.app.ng.component('preregister',{
        templateUrl: '/scripts/components/preregister/preregister.html',
        controller: function($scope, $state, votingController, notificationsService, idUnionAuthenticator) {
            $scope.preRegister = () => {
                try {
                    votingController.preRegister();
                    notificationsService.success('Request sent');
                } catch (e) {
                    notificationsService.error(e.message);
                }
            };

            async function updateRequest(connectionId) {
                let request = await idUnionAuthenticator
                    .getRequestByConnectionId(connectionId);

                $scope.request = request;
            }

            idUnionAuthenticator.on('UserAuthenticationRequired',
                async(err, ev) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    // check if this request is our own
                    if(ev.addr == $state.params.account) {
                        $scope.connectionId = ev.connectionId;
                        await updateRequest(ev.connectionId);
                        $scope.$apply();
                    }
                    
            });

            idUnionAuthenticator.on('AuthenticationConnectionEstablished',
                async(err, ev) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                   
                    if($scope.connectionId == ev.connectionId) {
                        await updateRequest(ev.connectionId);
                        $scope.$apply();
                    }
            });

            idUnionAuthenticator.on('AuthenticationResultReady',
                async(err, ev) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    if($scope.connectionId != ev.connectionId) {
                        return
                    }

                    await updateRequest(ev.connectionId);
                    $scope.$apply();

                    // check if user is pre-registered now
                    votingController.isPreRegistered().then(preRegistered => {
                        if (preRegistered) {
                            $state.go('root.state.vote', null, { location: 'replace' });
                        } else {
                            // TODO: let user generate new qr code
                            notificationsService.error("Something went wrong");
                        }
                    })
            });
        }
    });
})();
