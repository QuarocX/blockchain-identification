pragma solidity ^0.4.3;

import "./AnonymousVoting.sol";

/**
 * The purpose of this contract is to provide a semi-identical interface
 * to that of `AnonymousVoting`. It's aim is to introduce changes to
 * `AnonymousVoting` without altering its source code. By intercepting
 * every call that would have been otherwise directly handled by `AnonymousVoting`,
 * this contract might perform some work before forwarding the calls to
 * their final destination. The contract can also omit some of
 * `AnonymousVoting`'s functionality by not exposing a matching function.
 *
 * It is assumed that this contract is the owner of a pre-deployed `AnonymousVoting`
 * contract whose address is given at the constructor. Being the owner of
 * `AnonymousVoting` contract means "owner-only" functions in `AnonymousVoting`
 * will authorize all calls incoming from this contract, even if they were triggered
 * by a non-owner external user. Thus `AnonymousVotingProxy` must also be owned, and
 * "owner-only" modifier must be appropriately applied.
 */
contract AnonymousVotingProxy is owned {
    AnonymousVoting public anonVoting;

    constructor(address _anonVotingAddr)
    public
    {
        anonVoting = AnonymousVoting(_anonVotingAddr);
    }

    /** Props **/
    function eligible(address addr)
    public view returns (bool) {
        return anonVoting.eligible(addr);
    }

    function registered(address addr)
    public view returns (bool) {
        return anonVoting.registered(addr);
    }

    function votecast(address addr)
    public view returns (bool) {
        return anonVoting.votecast(addr);
    }

    function commitment(address addr)
    public view returns (bool) {
        return anonVoting.commitment(addr);
    }

    function refunds(address addr)
    public view returns (uint) {
        return anonVoting.refunds(addr);
    }

    function finishSignupPhase()
    public view returns (uint)
    {
        return anonVoting.finishSignupPhase();
    }

    function endSignupPhase()
    public view returns (uint)
    {
        return anonVoting.endSignupPhase();
    }

    function endCommitmentPhase()
    public view returns (uint)
    {
        return anonVoting.endCommitmentPhase();
    }

    function endVotingPhase()
    public view returns (uint)
    {
        return anonVoting.endVotingPhase();
    }

    function endRefundPhase()
    public view returns (uint)
    {
        return anonVoting.endRefundPhase();
    }

    function totalregistered()
    public view returns (uint)
    {
        return anonVoting.totalregistered();
    }

    function totaleligible()
    public view returns (uint)
    {
        return anonVoting.totaleligible();
    }

    function totalcommitted()
    public view returns (uint)
    {
        return anonVoting.totalcommitted();
    }

    function totalvoted()
    public view returns (uint)
    {
        return anonVoting.totalvoted();
    }

    function totalrefunded()
    public view returns (uint)
    {
        return anonVoting.totalrefunded();
    }

    function totaltorefund()
    public view returns (uint)
    {
        return anonVoting.totaltorefund();
    }

    function question()
    public view returns (string)
    {
        return anonVoting.question();
    }

    function finaltally(uint index)
    public view returns (uint)
    {
        return anonVoting.finaltally(index);
    }

    function commitmentphase()
    public view returns (bool)
    {
        return anonVoting.commitmentphase();
    }

    function depositrequired()
    public view returns (uint)
    {
        return anonVoting.depositrequired();
    }

    function gap()
    public view returns (uint)
    {
        return anonVoting.gap();
    }

    function charity()
    public view returns (address)
    {
        return anonVoting.charity();
    }

    function state()
    public view returns (uint)
    {
        return uint(anonVoting.state());
    }

    function lostdeposit()
    public view returns (uint)
    {
        return anonVoting.lostdeposit();
    }
    /** End  Props **/

    /**
     * Instead of passing through all calls, the function re-implements the checks
     * performs by the destination function by using `require` calls. Through `require`
     * we are able to deliver a more informative error message on went wrong which is
     *
     * not the case with destination function.
     * This is a payable function, thus it also forwards all incoming value to destination.
     */
    function beginSignUp(string _question, bool enableCommitmentPhase,
         uint _finishSignupPhase, uint _endSignupPhase,
         uint _endCommitmentPhase, uint _endVotingPhase, uint _endRefundPhase,
         uint _depositrequired)
    onlyOwner public payable returns (bool)
    {
        require(_finishSignupPhase > 0 + gap() && _depositrequired >= 0, "beginSignUp require check 1 failed");

        // Ensure each time phase finishes in the future...
        // Ensure there is a gap of 'x time' between each phase.
        require(_endSignupPhase-gap() >= _finishSignupPhase, "beginSignUp require check 2 failed");

        // We need to check Commitment timestamps if phase is enabled.
        if(enableCommitmentPhase) {
            // Make sure there is a gap() between 'end of registration' and 'end of commitment' phases.
            require(_endCommitmentPhase-gap() >= _endSignupPhase, "beginSignUp require check 3 failed");

            // Make sure there is a gap() between 'end of commitment' and 'end of vote' phases.
            require(_endVotingPhase-gap() >= _endCommitmentPhase, "beginSignUp require check 4 failed");

        } else {
            // We have no commitment phase.
            // Make sure there is a gap() between 'end of registration' and 'end of vote' phases.
            require(_endVotingPhase-gap() >= _endSignupPhase, "beginSignUp require check 5 failed");
        }

        // Provide time for people to get a refund once the voting phase has ended.
        require(_endRefundPhase-gap() >= _endVotingPhase, "beginSignUp require check 6 failed");


        // Require Election Authority to deposit ether.
        require (msg.value  == _depositrequired, "beginSignUp require check 7 failed");

        return anonVoting.beginSignUp.value(msg.value)(
            _question, enableCommitmentPhase, _finishSignupPhase,
            _endSignupPhase, _endCommitmentPhase, _endVotingPhase,
            _endRefundPhase, _depositrequired
        );
    }

    function deadlinePassed()
    public returns (bool)
    {
        return anonVoting.deadlinePassed();
    }

    function register(uint[2] xG, uint[3] vG, uint r)
    public payable returns (bool)
    {
        return anonVoting.register(xG, vG, r);
    }

    function finishRegistrationPhase()
    onlyOwner public returns (bool)
    {
        return anonVoting.finishRegistrationPhase();
    }

    function submitCommitment(bytes32 h)
    public
    {
        return anonVoting.submitCommitment(h);
    }

    function submitVote(
        uint[4] params, uint[2] y, uint[2] a1, uint[2] b1,
        uint[2] a2, uint[2] b2)
    public returns (bool)
    {
        return anonVoting.submitVote(params, y, a1, b1, a2, b2);
    }

    function computeTally()
    onlyOwner public
    {
        anonVoting.computeTally();
    }

    function sendToCharity()
    public
    {
        anonVoting.sendToCharity();
    }

    function withdrawRefund()
    public
    {
        anonVoting.withdrawRefund();
    }
}
