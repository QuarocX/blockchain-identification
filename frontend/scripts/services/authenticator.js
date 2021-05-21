(function(){
    class AuthenticatorService {
        constructor(contract) {
            this.contract = contract;
        }
    }
    window.app.ng.factory('authenticatorService', (authenticatorContract) => {
        return new AuthenticatorService(authenticatorContract);
    });
})();
