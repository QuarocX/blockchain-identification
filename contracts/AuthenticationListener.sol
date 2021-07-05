interface AuthenticationListener {
    function onReVerificationRequired(string connectionId, string proof);
    function onAuthenticationComplete(address addr, bool result);
}
