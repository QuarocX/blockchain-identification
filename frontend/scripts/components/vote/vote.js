(function(){
    window.app.ng.component('vote',{
        templateUrl: '/scripts/components/vote/vote.html',
        controller: async function($state, anonymousVoting, $interval) {
            async function updateState() {
                switch (await anonymousVoting.state()) {
                    case 0: {
                        break;
                    }
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
            updateState();
            $interval(updateState, 5000);
        }
    });
})();
