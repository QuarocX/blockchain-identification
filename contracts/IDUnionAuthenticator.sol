pragma solidity ^0.4.3;

contract IDUnionAuthenticator {

    enum AuthenticationRequestStatus {
        NotValid,
        Pending,
        Failure,
        Success
    }

    struct AuthenticationRequest {
        address addr;
        uint256 id; 
        AuthenticationRequestStatus status;
    }

    event AuthenticationRequested(uint256 requestId);
    event AuthenticationResultReady(uint256 requestId);

    mapping (uint256 => AuthenticationRequest) public requestsLookup;
    mapping (address => uint256) public requestsReverseLookup;
 
    uint256 private nextRequestId = 1;

    function requestAuthentication(address addr)
    public returns (uint256) {
        uint256 requestId = nextRequestId++;
       requestsLookup[requestId] = AuthenticationRequest(
           addr, requestId, AuthenticationRequestStatus.Pending);

       requestsReverseLookup[addr] = requestId;

       //  emit AuthenticationRequested(requestId);

        return requestId;
    }

    function authenticationRequestStatus(uint256 requestId)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[requestId].status;
    }

    function authenticationRequestStatus(address addr)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[requestsReverseLookup[addr]].status;
    }

    function setAuthenticationResult(uint256 requestId, bool result) {
        AuthenticationRequest request = requestsLookup[requestId];
        require(request.status == AuthenticationRequestStatus.Pending,
                "requestId is not pending auth");

        if (result ) {
            request.status = AuthenticationRequestStatus.Success;
        } else {
            request.status = AuthenticationRequestStatus.Failure;
        }

        emit AuthenticationResultReady(requestId);
    }
}
