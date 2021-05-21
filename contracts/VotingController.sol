pragma solidity ^0.4.3;

import "./AnonymousVoting.sol";
import "./AnonymousVotingProxy.sol";

contract VotingController is AnonymousVotingProxy {
    constructor(address _anonVotingAddr) AnonymousVotingProxy(_anonVotingAddr)
    public
    {}

    /* 
    list of addresses allowed to vote
    TODO: Think about how we will add new eligible voters
    */
    address[] public addresses; // use this for iterating and sending all addresses
    mapping (address => bool) public eligible; // for efficient checking

    function preRegister() {
        address _sender = msg.sender;
        require(!eligible[_sender], "this address already is eligible for voting");
        // TODO: do some additional checks and call authentication contract

        // on success: add this address as eligible voter
        eligible[_sender] = true;
        addresses.push(_sender);
    }

    /*
    Only the voting administrator can call this function to end the pre-registration phase and move to the next voting phase.
    All pre-registered and authenticated users will be send to the anonymous voting contract. 

    TODO: Maybe add some cooldown or something...
     */
    function endPreRegistration() onlyOwner public {
        anonVoting.setEligible(addresses);
    }

    function getPreRegisteredVoterCount() view returns (uint) {
        return addresses.length;
    }
}
