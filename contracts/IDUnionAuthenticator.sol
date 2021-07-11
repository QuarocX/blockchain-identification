pragma solidity ^0.4.3;
pragma experimental ABIEncoderV2;
import "./AuthenticationListener.sol";

contract IDUnionAuthenticator {

    enum AuthenticationRequestStatus {
        NotValid,
        Waiting, // waiting for user authentication
        Connected, // user connected to verifier
        Validating, // request sender needs to validate that proof is correct
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

    mapping (string => string) private connectionIdToProof;
    mapping (string => bool) private usedProofs;

    mapping (string => AuthenticationRequest) private requestsLookup;
    mapping (address => string) public requestsReverseLookup;
    mapping (uint256 => address) private requestToSenderLookup;

    string[] public connectionIds;
    uint256 private nextRequestId = 1;

    string private credentials = '{"proof_requests":[{"name":"Proof of age","attributes_restrictions":{"dateOfBirth":{"name":"dateOfBirth","p_type":"<=","p_value":20030101,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]},"ZipCodeSmall":{"name":"addressZipCode","p_type":"<=","p_value":14199,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]},"ZipCodeBig":{"name":"addressZipCode","p_type":">=","p_value":10115,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]}},"cred_def":{"restriction":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]}},{"name":"Proof of attributes","attributes":{"names":["firstName","familyName","addressStreet","addressCity","placeOfBirth","dateOfExpiry","dateOfBirth","addressZipCode","addressCountry"]},"attributes_restrictions":{"dateOfBirth":{"name":"dateOfBirth","p_type":"<=","p_value":20030101,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]},"ZipCodeSmall":{"name":"addressZipCode","p_type":"<=","p_value":14199,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]},"ZipCodeBig":{"name":"addressZipCode","p_type":">=","p_value":10115,"restrictions":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]}},"cred_def":{"restriction":[{"cred_def_id":"ELMkCtYoz86qnJKeQqrL1M:3:CL:165:masterID Dev Rev"}]}}]}';
    
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
    This function can only be called by the user who is being authenticated.
    */
    function startUserAuthentication(uint256 requestId,
                                     string connectionId,
                                     string connectionUrl) public {
        address addr = msg.sender;

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
        require(usedProofs[proof] == false, "This proof was already used for authentication.");

        request.status = AuthenticationRequestStatus.Validating;

        connectionIdToProof[connectionId] = proof;
        usedProofs[proof] = true;

        // notify request owner and ask vor validation/re-verification
        AuthenticationListener listener = AuthenticationListener(request.sender);
        listener.onReVerificationRequired(connectionId, proof);
    }

    // STEP 5: re-verification/validation in request owner contract (e.g. VotingController)

    /*
    STEP 6:
    We want at least one automated trusted check so that a user can not add himself.
    This check needs to be performed by the smart contract which initially requested the authentication.
    (e.g. VotingController)
    
    Any observer is also able to check and re-verify this proof.
    */
    function validateAuthenticationResult(string connectionId, bool result) public {
        AuthenticationRequest request = requestsLookup[connectionId];
        require(request.status == AuthenticationRequestStatus.Validating,
                "requestId is not pending auth");
        require(request.sender == msg.sender, "only the request owner can validate the authentication");

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
