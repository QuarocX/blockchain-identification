(function(){
    window.app.ng.component('vote',{
        templateUrl: '/scripts/components/vote/vote.html',
        controller: function($scope, $state, anonymousVoting,
            notificationsService) {
            let data = {
                question: anonymousVoting.question(),
                state: anonymousVoting.state(),
                registered: anonymousVoting.registered()
            };
            console.log(data);
            if (data.state == 1) {
                $state.go('root.state.vote.signup');
            } else {
                console.error("Unsupported state");
            }
        }
    });
})();
