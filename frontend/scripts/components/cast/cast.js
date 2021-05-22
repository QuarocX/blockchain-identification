(function(){
    window.app.ng.component('cast',{
        templateUrl: '/scripts/components/cast/cast.html',
        controller: function($scope, $state, anonymousVoting, notificationsService) {
            let data = {
               totalvoted: anonymousVoting.totalvoted(), 
               totaleligible: anonymousVoting.totaleligible(),
               endVotingPhase: anonymousVoting.endVotingPhase(),
               votingFinished: (new Date()).getTime() > anonymousVoting.endVotingPhase()
            };
            let votebytimer = new Date(data.endVotingPhase);
            data.endVotingPhaseFormatted = clockformat(votebytimer);
            $scope.data = data;

            console.log(data);
            $scope.castYes = () => {
                anonymousVoting.submitVote(1);
            };
            $scope.castNo= () => {
                anonymousVoting.submitVote(0);
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
