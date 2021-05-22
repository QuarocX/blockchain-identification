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
            switch (data.state) {
                case 1: {
                    $state.go('root.state.vote.signup', null, {
                        location: 'replace'});
                    break;
                }
                case 2: {
                    console.error('Commitment phase not supported');
                    break;
                }
                case 3: {
                    $state.go('root.state.vote.cast', null, {
                        location: 'replace'});
                    break;
                }
                case 4: {
                    $state.go('root.state.vote.result', null, {
                        location: 'replace'})
                    break;
                }
                default: {
                    console.error("Unsupported state");
                }
            }
        }
    });
})();
