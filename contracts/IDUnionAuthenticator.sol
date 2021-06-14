pragma solidity ^0.4.3;
pragma experimental ABIEncoderV2;
import "./AuthenticationListener.sol";

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
        string connectionId;
        address sender; // e.g. votingcontroller
        AuthenticationRequestStatus status;
        string connectionUrl;
    }

    // listen to this event in the verifier
    event AuthenticationRequested(uint256 requestId, address addr, string credentials);
    // events used in the user frontend
    event UserAuthenticationRequired(address addr, string connectionId);
    event AuthenticationConnectionEstablished(string connectionId);
    event AuthenticationResultReady(string connectionId);

    mapping (string => AuthenticationRequest) private requestsLookup;
    mapping (address => string) public requestsReverseLookup;
    mapping (uint256 => address) private requestToSenderLookup;

    string[] public connectionIds;
    uint256 private nextRequestId = 1;

    string private credentials = '{"attributes":{"names":["firstName","familyName","addressStreet","addressCity","placeOfBirth","dateOfExpiry","addressCountry"]},"cred_def":{"restriction":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"attributes_restrictions":{"dateOfBirth":{"name":"dateOfBirth","p_type":"<=","p_value":20030101,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"postalCode1":{"name":"addressZipCode","p_type":"<=","p_value":14199,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"postalCode2":{"name":"addressZipCode","p_type":">=","p_value":10115,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]}}}';

    /*
    STEP 1: Request authentication for a specific ethereum address
    */
    function requestAuthentication(address addr) public {
        uint256 requestId = nextRequestId++;
        requestToSenderLookup[requestId] = msg.sender;

        emit AuthenticationRequested(requestId, addr, credentials);

        // ---- FOR TESTING ONLY ----
        // directly call the listener
        //AuthenticationListener listener = AuthenticationListener(msg.sender);
        //listener.onAuthenticationComplete(addr, true);

        // OR use standard flow
        //startUserAuthentication(requestId, 0);
        //connectionEstablished(requestId);
        //setAuthenticationResult(requestId, true);
        // ---- END TESTING ----
    }

    /*
    STEP 2: Get authentication URL/connection ID for QR-Code generation
    */
    function startUserAuthentication(uint256 requestId,
                                     address addr,
                                     string connectionId,
                                     string connectionUrl) public {
        requestsLookup[connectionId] =
            AuthenticationRequest(
                addr,
                connectionId,
                requestToSenderLookup[requestId],
                AuthenticationRequestStatus.Waiting,
                connectionUrl
            );
        requestsReverseLookup[addr] = connectionId;
        connectionIds.push(connectionId);
        emit UserAuthenticationRequired(addr, connectionId);
    }

    /*
    STEP 3: Verifier notifies contract that connection has been established
    */
    function connectionEstablished(string connectionId) public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Waiting, 
                "connectionId ist not waiting to establish a connection");

        request.status =  AuthenticationRequestStatus.Connected;

        emit AuthenticationConnectionEstablished(connectionId);
    }

    /*
    STEP 4: Set authentication result for the requestId.

    result: authentication was succesful AND voter is eligible
    */
    function setAuthenticationResult(string connectionId, bool result) public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Connected,
                "requestId is not pending auth");

        if (result) {
            request.status = AuthenticationRequestStatus.Success;
        } else {
            request.status = AuthenticationRequestStatus.Failure;
        }

        // notify sender
        AuthenticationListener listener = AuthenticationListener(request.sender);
        listener.onAuthenticationComplete(request.addr, result);

        emit AuthenticationResultReady(connectionId);
    }

    function getAuthenticationRequest(string connectionId)
    public view returns (AuthenticationRequest) {
        return requestsLookup[connectionId];
    }

    function getNumberOfConnections()
    public view returns (uint256) {
        return connectionIds.length;
    }

    function authenticationRequestStatus(string connectionId)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[connectionId].status;
    }

    function authenticationRequestStatus(address addr)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[requestsReverseLookup[addr]].status;
    }
}
