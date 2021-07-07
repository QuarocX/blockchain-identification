pragma solidity ^0.4.3;
pragma experimental ABIEncoderV2;
import "./AuthenticationListener.sol";
import "./AnonymousVoting.sol";

contract IDUnionAuthenticator is owned {

    enum AuthenticationRequestStatus {
        NotValid,
        Waiting, // waiting for user authentication
        Connected, // user connected to verifier
        Validating, // admin needs to validate that proof is correct
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

    // listen to this event in the verifier (user side)
    event AuthenticationRequested(uint256 requestId, address addr, string credentials);
    // events used in the user frontend
    event UserAuthenticationRequired(address addr, string connectionId);
    event AuthenticationConnectionEstablished(string connectionId);
    event AuthenticationResultReady(string connectionId);
    // listen to this event in the verifier (admin side)
    event ReVerificationRequired(string connectionId, string proof);

    mapping (string => string) private connectionIdToProof;
    mapping (string => string) private connectionIdToUuid;

    mapping (string => AuthenticationRequest) private requestsLookup;
    mapping (address => string) public requestsReverseLookup;
    mapping (uint256 => address) private requestToSenderLookup;

    string[] public connectionIds;
    uint256 private nextRequestId = 1;

    string private credentials = '{"attributes":{"names":["firstName","familyName","addressStreet","addressCity","placeOfBirth","dateOfExpiry","addressCountry"]},"cred_def":{"restriction":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"attributes_restrictions":{"dateOfBirth":{"name":"dateOfBirth","p_type":"<=","p_value":20030101,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"postalCode1":{"name":"addressZipCode","p_type":"<=","p_value":14199,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]},"postalCode2":{"name":"addressZipCode","p_type":">=","p_value":10115,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev","schema_id":"BdriWEaTqe1LewNHbBbTSZ:2:masterID:0.1","schema_issuer_did":"BdriWEaTqe1LewNHbBbTSZ","schema_name":"masterID","schema_version":"0.1"}]}}}';

    /*
    The verifier runs on the users side, i.e. we only want the user starting connections and pass us the proof.
    Use this modifier for functions only allowed to be called by the user who initiated the authentication request.
    */
    modifier onlyUser(string connectionId) {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(msg.sender == request.addr,
         "This function must be called by the user who is being authenticated.");
        _;
    }

    /*
    STEP 1: Request authentication for a specific ethereum address.
    This function must be called by a contract implementing the AuthenticationListener interface, e.g. the VotingController.
    */
    function requestAuthentication(address addr) public {
        uint256 requestId = nextRequestId++;
        requestToSenderLookup[requestId] = msg.sender;

        emit AuthenticationRequested(requestId, addr, credentials);

        // ---- FOR TESTING ONLY ----
        // directly call the listener
        //AuthenticationListener listener = AuthenticationListener(msg.sender);
        //listener.onAuthenticationComplete(addr, true);

        // OR use standard flow [then remove "onlyOwner" in called functions]
        //startUserAuthentication(requestId, 0);
        //connectionEstablished(requestId);
        //setAuthenticationResult(requestId, true);
        // ---- END TESTING ----
    }

    /*
    STEP 2: Set authentication URL/connection ID for QR-Code generation
    */
    function startUserAuthentication(uint256 requestId,
                                     address addr,
                                     string connectionId,
                                     string connectionUrl) public {
        require(msg.sender == addr,
         "This function must be called by the user who is being authenticated.");

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
    function connectionEstablished(string connectionId) onlyUser(connectionId) public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Waiting, 
                "connectionId is not waiting to establish a connection");

        request.status =  AuthenticationRequestStatus.Connected;

        emit AuthenticationConnectionEstablished(connectionId);
    }

    /*
    STEP 4: Set authentication result for the given connectionId. 
    Containing a proof which can be re-validated by the admin in STEP 5.
    */
    function setAuthenticationResult(string connectionId, string proof) onlyUser(connectionId) public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Connected,
                "requestId is not pending auth");

        request.status = AuthenticationRequestStatus.Validating;

        connectionIdToProof[connectionId] = proof;
        emit ReVerificationRequired(connectionId, proof);

        // ---- FOR TESTING ONLY ----
        // [then remove "onlyOwner" in called function]
        // validateAuthenticationResult(connectionId, result);
        // ---- END TESTING ----
    }

    /*
    STEP 5: the voting admin/initiator needs to verify that voter is eligible.
    We want at least one automated trusted check (by voting admin) so that a voter can not add himself.
    
    Any observer is also able to check and re-verify this proof.

    */
    function validateAuthenticationResult(string connectionId, bool result) onlyOwner public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Validating,
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

     /*
     Observers can call this function to get the stored proof of a specific connectionId and re-verify it.
     */
    function getProof(string connectionId) public view returns (string) {
        return connectionIdToProof[connectionId];
    }
    
    function setUuid(string connectionId, string u_uid) onlyOwner public {
        connectionIdToUuid[connectionId] = u_uid;
    }
    
    function getUuid(string connectionId) public view returns (string) {
        return connectionIdToUuid[connectionId];
    }

    function getAuthenticationRequest(string connectionId)
    public view returns (AuthenticationRequest) {
        return requestsLookup[connectionId];
    }

    function getLatestAuthenticationRequest(address addr)
    public view returns (AuthenticationRequest) {
        return requestsLookup[requestsReverseLookup[addr]];
    }

    function getNumberOfConnections()
    public view returns (uint256) {
        return connectionIds.length;
    }

    function authenticationRequestStatus(string connectionId)
    public view returns (AuthenticationRequestStatus) {
        return requestsLookup[connectionId].status;
    }
}
