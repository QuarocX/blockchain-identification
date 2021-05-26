pragma solidity ^0.4.3;

contract IDUnionAuthenticator {

    enum AuthenticationRequestStatus {
        NotValid,
        Created, // new request was created
        Waiting, // waiting for user authentication
        Connected, // user connected to verifier
        Failure,
        Success
    }

    struct AuthenticationRequest {
        address addr;
        uint256 id;
        uint256 connectionId; // 0 if currently created
        AuthenticationRequestStatus status;
    }

    // listen to this event in the verifier
    event AuthenticationRequested(uint256 requestId);
    // events used in the user frontend
    event UserAuthenticationRequired(uint256 requestId);
    event AuthenticationConnectionEstablished(uint256 requestId);
    event AuthenticationResultReady(uint256 requestId);

    mapping (uint256 => AuthenticationRequest) public requestsLookup;
    mapping (address => uint256) public requestsReverseLookup;
 
    uint256 private nextRequestId = 1;

    /*
    STEP 1: Request authentication for a specific ethereum address
    */
    function requestAuthentication(address addr)
    public returns (uint256) {
        uint256 requestId = nextRequestId++;
        requestsLookup[requestId] = AuthenticationRequest(
           addr, requestId, 0, AuthenticationRequestStatus.Created);
           
        requestsReverseLookup[addr] = requestId;
        
        emit AuthenticationRequested(requestId);

        return requestId;
    }

    /*
    STEP 2: Get authentication URL/connection ID for QR-Code generation
    */
    function startUserAuthentication(uint256 requestId, uint256 connectionId) public {
        AuthenticationRequest request = requestsLookup[requestId];
        request.status = AuthenticationRequestStatus.Waiting;
        request.connectionId = connectionId;

        emit UserAuthenticationRequired(requestId);
    }

    /*
    STEP 3: Verifier notifies contract that connection has been established
    */
    function connectionEstablished(uint256 requestId) public {
        AuthenticationRequest request = requestsLookup[requestId];
        require(request.status == AuthenticationRequestStatus.Waiting, 
                "requestId ist not waiting to establish a connection");
        
        request.status =  AuthenticationRequestStatus.Connected;

        emit AuthenticationConnectionEstablished(requestId);
    }

    /*
    STEP 4: Set authentication result for the requestId.

    result: authentication was succesful AND voter is eligible
    */
    function setAuthenticationResult(uint256 requestId, bool result) public {
        AuthenticationRequest request = requestsLookup[requestId];
        require(request.status == AuthenticationRequestStatus.Connected,
                "requestId is not pending auth");

        if (result) {
            request.status = AuthenticationRequestStatus.Success;
        } else {
            request.status = AuthenticationRequestStatus.Failure;
        }

        emit AuthenticationResultReady(requestId);
    }

    function authenticationRequestStatus(uint256 requestId)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[requestId].status;
    }

    function authenticationRequestStatus(address addr)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[requestsReverseLookup[addr]].status;
    }
}
