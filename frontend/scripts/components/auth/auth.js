(function(){
    window.app.ng.component('auth',{
        templateUrl: '/scripts/components/auth/auth.html',
        controller: async function($scope, idUnionAuthenticator) {
            $scope.requests = await idUnionAuthenticator.requests();

            async function updateRequest(connectionId) {
                let request = await idUnionAuthenticator
                    .getRequestByConnectionId(connectionId);

                let index = $scope.requests.findIndex((item) => {
                    return request.connectionId == item.connectionId;
                });

                if (index >= 0) {
                    $scope.requests[index] = request;
                } else {
                    $scope.requests.push(request);
                }
            }
            idUnionAuthenticator.on('UserAuthenticationRequired',
                async(err, ev) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    await updateRequest(ev.connectionId);
                    $scope.$apply();
                });
            idUnionAuthenticator.on('AuthenticationConnectionEstablished',
                async(err, ev) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    await updateRequest(ev.connectionId);
                    $scope.$apply();
                });
            $scope.$apply();

            $scope.establishConnection = (requestId) =>  {
                idUnionAuthenticator.startUserAuthentication(requestId,
                    1234
                );
            }

            $scope.qrCodeClicked = (data) => {
                console.log(data);
            }
        }
    });
})();
