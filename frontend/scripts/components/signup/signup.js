(function(){
    function clockformat(date) {
       var mins = "";

       if(date.getMinutes() < 10) {
         mins = "0" + date.getMinutes();
       } else {
         mins = date.getMinutes();
       }
       var toString = date.getHours() + ":" + mins + ", ";

       toString = toString + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

       return toString;
    }
 
    window.app.ng.component('signup',{
        templateUrl: '/scripts/components/signup/signup.html',
        controller: function($scope, $state, anonymousVoting,
            notificationsService, web3, localCrypto) {
            var x, xG, v, w, r, d;
            const currentTime = new Date().getTime();

            let data = {
                depositrequired: web3.fromWei(anonymousVoting.depositrequired()),
                registered: anonymousVoting.registered(),
                question: anonymousVoting.question(),
                totaleligible: anonymousVoting.totaleligible(),
                totalregistered: anonymousVoting.totalregistered(),
                endSignupPhase: anonymousVoting.endSignupPhase(),
                finishSignupPhase: anonymousVoting.finishSignupPhase(),
                registered: anonymousVoting.registered(),
                signupFinished: currentTime > anonymousVoting.endSignupPhase(),
                balance: web3.fromWei(web3.eth.getBalance($state.params.account)),
                codes: ''
            };
            let date = new Date();

            date.setTime(data.finishSignupPhase);
            data.finishSignupPhaseFormatted = clockformat(date);

            date.setTime(data.endSignupPhase);
            data.endSignupPhaseFormatted = clockformat(date);

            console.log(data);

            $scope.data = data;
            $scope.register = () => {
                let single_zkp = localCrypto.createZKP(x, v, xG);
                let vG = [single_zkp[1], single_zkp[2], single_zkp[3]];

                // Lets make sure the ZKP is valid!
                let verifyres = localCrypto.verifyZKP(xG, single_zkp[0], vG);
                if (!verifyres) {
                    notificationsService.error("Problem with voting codes");
                    return;
                }
                if (anonymousVoting.register(xG, vG, single_zkp[0])) {
                    notificationsService.success("Successfully registered");
                    data.registered = anonymousVoting.registered();
                    data.totalregistered = anonymousVoting.totalregistered();
                } else {
                    notificationsService.error(
                    "Registration failed... Problem could be your voting codes or that you have already registered");
                }
            }
            $scope.onFileSelected = (event) => {
                var input = event.target;
                var reader = new FileReader();
                reader.onload = () => {
                    var text = reader.result.split("\n");
                    var row = text[0].split(",");
                    // We are expecting 7 numbers...
                    if (row.length == 7) {
                        x = new BigNumber(row[0]);
                        xG = [new BigNumber(row[1]), new BigNumber(row[2])];
                        v = new BigNumber(row[3]);
                        w = new BigNumber(row[4]);
                        r = new BigNumber(row[5]);
                        d = new BigNumber(row[6]);
                        $scope.data.codes = reader.result;
                    } else {
                        notificationsService.error("Problem with uploaded file..." + row.length);
                    }
                    $scope.$apply();
                }
                reader.readAsText(input.files[0]);
            };

        }
    });
})();
