pragma solidity ^0.4.3;

import './AnonymousVoting.sol';

contract owned {
    address public owner;

    /* Initialise contract creator as owner */
    function owned() {
        owner = msg.sender;
    }

    /* Function to dictate that only the designated owner can call a function */
	  modifier onlyOwner {
        if(owner != msg.sender) throw;
        _;
    }

    /* Transfer ownership of this contract to someone else */
    function transferOwnership(address newOwner) onlyOwner() {
        owner = newOwner;
    }
}

contract VotingController is owned {

    AnonymousVoting public anonymousContract;

    function VotingController(uint _gap, address _charity) {
        // create a new anonymous voting contract
        anonymousContract = new AnonymousVoting(_gap, _charity);
    }

    /* 
    list of addresses allowed to vote
    TODO: Think about how we will add new eligble voters
    */
    address[] public addresses;

    /* Send all collected addresses as an array to the anonymous voting contract
    Call this function only if all voters are registered.
    Do not expose this function to anyone but this contract.
     */
    function setEligible() private {
        anonymousContract.setEligible(addresses);
    }

}