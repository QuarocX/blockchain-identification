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

    function register() {
        address _sender = msg.sender;
        require(!eligible[_sender], "this address is already eligible for voting");
        // TODO: do some additional checks and call authentication contract

        // on success: add this address as eligible voter
        addresses.push(msg.sender);
    }

    /* Send all collected addresses as an array to the anonymous voting contract
    Call this function only if all voters are registered.
    Do not expose this function to anyone but this contract.
     */
    function setEligible() private {
        anonymousContract.setEligible(addresses);
    }
}
