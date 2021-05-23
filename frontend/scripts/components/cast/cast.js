(function(){
    window.app.ng.component('cast',{
        templateUrl: '/scripts/components/cast/cast.html',
        controller: async function($scope, $state, anonymousVoting,
            notificationsService) {

            $scope.loading = {
                'yes': false,
                'no': false
            };
            $scope.data = {};
            $scope.data.totalvoted = await anonymousVoting.totalvoted();
            $scope.data.totaleligible = await anonymousVoting.totaleligible();
            $scope.data.endVotingPhase =
                await anonymousVoting.endVotingPhase();
            $scope.data.votingFinished = (new Date()).getTime()
                    > await anonymousVoting.endVotingPhase();
            $scope.data.endVotingPhaseFormatted =
                clockformat(new Date($scope.data.endVotingPhase));
            $scope.data.votecast = await anonymousVoting.votecast();

            console.log($scope.data);
            $scope.$apply();

            async function submitVote(choice) {
                $scope.loading[choice ? 'yes' :  'no'] = true;
                try {
                    await anonymousVoting.submitVote(choice);
                    $scope.data.votecast = await anonymousVoting.votecast();
                    $scope.data.totalvoted =
                        await anonymousVoting.totalvoted();
                    notificationsService.success(
                        'Vote submitted successfully');
                } catch (ex) {
                    console.error(ex);
                    notificationsService.error(ex);
                }
                $scope.loading.yes = false;
                $scope.loading.no = false;
                $scope.$apply();
            }
            $scope.castYes = async () => { await submitVote(1) };
            $scope.castNo = async () => { await submitVote(0) };
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

       toString = toString + (date.getMonth() + 1) + "/" + date.getDate() +
            "/" + date.getFullYear();

       return toString;
    }
})();
