(function(){
    window.app.ng.component('signup',{
        templateUrl: '/scripts/components/signup/signup.html',
        controller: function($scope, $state, anonymousVoting,
            notificationsService, web3) {
            var x, xG, v, w, r, d;

            let data = {
                depositrequired: anonymousVoting.depositrequired()
                    .then(web3.utils.fromWei),
                registered: anonymousVoting.registered(),
                question: anonymousVoting.question(),
                totaleligible: anonymousVoting.totaleligible(),
                totalregistered: anonymousVoting.totalregistered(),
                endSignupPhase: anonymousVoting.endSignupPhase()
                    .then((v) => (new Date(v)))
                    .then(clockformat),
                finishSignupPhase: anonymousVoting.finishSignupPhase()
                    .then((v) => (new Date(v)))
                    .then(clockformat),
                signupFinished: anonymousVoting.endSignupPhase()
                    .then((val) => ((new Date()).getTime() > val)),
                balance: web3.eth.getBalance($state.params.account)
                    .then(web3.utils.fromWei),
            };
            $scope.data = {
                codes: '',
                loading: false
            };
            for (const [k, v] of Object.entries(data)) {
                v.then((val) => {
                    $scope.data[k] = val;
                    $scope.$apply();
                });
            }
            $scope.register = () => {
                $scope.loading = true;
                anonymousVoting.register(x, xG, v, w, r, d).then(() => {
                    notificationsService.success("Successfully registered");
                    anonymousVoting.registered().then((res) => {
                        $scope.data.registered = res;
                        $scope.$apply();
                    });
                    anonymousVoting.totalregistered().then((res) => {
                        $scope.data.totalregistered = res;
                        $scope.loading = false;
                        $scope.$apply();
                    });
                    $scope.$apply();
                }, () => {
                    $scope.loading = false;
                    notificationsService.error(
                        "Registration failed... Problem could be your voting " +
                        "codes or you have already registered, or your address is ineligible");
                    $scope.$apply();
                });
            }
            $scope.onFileSelected = (event) => {
                var input = event.target;
                var reader = new FileReader();
                reader.onload = () => {
                    var text = reader.result.split("\n");
                    var row = text[0].split(",");
                    // We are expecting 7 numbers...
                    if (row.length == 7) {
                        x = row[0];
                        xG = [row[1], row[2]];
                        v = row[3];
                        w = row[4];
                        r = row[5];
                        d = row[6];
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
})();
