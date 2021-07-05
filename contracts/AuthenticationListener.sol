interface AuthenticationListener {
    function onReVerificationRequired(string connectionId);
    function onAuthenticationComplete(address addr, bool result);
}
