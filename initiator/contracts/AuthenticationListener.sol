interface AuthenticationListener {
    function onReVerificationRequired(string connectionId, bytes proof);
    function onAuthenticationComplete(address addr, bool result);
}
