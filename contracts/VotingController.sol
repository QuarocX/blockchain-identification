pragma solidity ^0.4.3;

import "./AnonymousVoting.sol";
import "./AnonymousVotingProxy.sol";

contract VotingController is AnonymousVotingProxy {
    constructor(address _anonVotingAddr) AnonymousVotingProxy(_anonVotingAddr)
    public
    {}
}
