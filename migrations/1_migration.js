const anonymousVotingContract = artifacts.require("AnonymousVoting");
const localCryptoContract = artifacts.require("LocalCrypto");

module.exports = async function (deployer) {
    // AnonymousVoting's contructor takes 2 arguments:
    // gap: Minimum number of seconds between stages.
    // charity: An ethereum address that will receive the deposits of
    //          participants if they do not participate in the vote.
    await deployer.deploy(anonymousVotingContract, 60,
            "0xf9476075c27f7a648dc55cbc42871b39a7b90988");
    await deployer.deploy(localCryptoContract);
};
