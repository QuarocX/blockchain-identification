pragma solidity ^0.4.3;

import "./AnonymousVoting.sol";
import "./AnonymousVotingProxy.sol";
import "./AuthenticationListener.sol";
import "./IDUnionAuthenticator.sol";

contract VotingController is AnonymousVotingProxy, AuthenticationListener {
    
    IDUnionAuthenticator authenticationController;

    constructor(address _anonVotingAddr, address _authenticatorAddr) AnonymousVotingProxy(_anonVotingAddr) public {
        authenticationController = IDUnionAuthenticator(_authenticatorAddr);
    }

    // list of addresses allowed to vote
    address[] public addresses; // use this for iterating and sending all addresses
    mapping (address => bool) public eligible; // for efficient checking
    bool public openPreRegistration = true;

    /* 
    STEP 0: Any user can request a pre-registration. 
    The user then needs to pass all required proofs to the authenticationController
     which eventually calls onAuthenticationComplete to pre-register the (eligible) user.

     -> See also STEP 1 - 5 in IDUnionAuthenticator.sol
    */
    function preRegister() public {
        require(addresses.length <= 40, "Maximum of voters reached");
        require(openPreRegistration, "pre-registration phase has ended");
        address _sender = msg.sender;
        require(!eligible[_sender], "this address already is eligible for voting");
        
        // call authentication contract
        authenticationController.requestAuthentication(_sender);
    }

    /*
     This function is called by the IDUnion Contract after all  
    */
    function onAuthenticationComplete(address addr, bool result) {
        require(msg.sender == address(authenticationController), 
            "only the authentication controller is allowed to set authentication result");
        if(!result || eligible[addr]) {
            return;
        }

        // on success: add this address as eligible voter
        eligible[addr] = true;
        addresses.push(addr);
    }

    /*
    Only the voting administrator can call this function to end the pre-registration phase and move to the next voting phase.
    All pre-registered and authenticated users will be send to the anonymous voting contract. 

    TODO: Maybe add some cooldown or something...
     */
    function endPreRegistration() onlyOwner public {
        require(addresses.length >= 3, "Minimum of 3 voters required");
        require(openPreRegistration, "pre-registration already ended");
        anonVoting.setEligible(addresses);
        openPreRegistration = false;
    }

    /*
    Allow the voting administrator to change the used authentication contract.
    */
    function setAuthenticationContract(address _authenticatorAddr) onlyOwner public {
        authenticationController = IDUnionAuthenticator(_authenticatorAddr);
    }

    function getPreRegisteredVoterCount() view returns (uint) {
        return addresses.length;
    }

    function isPreRegistered() view returns (bool) {
        return eligible[msg.sender];
    }
}
