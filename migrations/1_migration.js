const anonymousVotingContract = artifacts.require("AnonymousVoting");
const localCryptoContract = artifacts.require("LocalCrypto");
const anonVotingController = artifacts.require("VotingController");

module.exports = async function (deployer) {
    // AnonymousVoting's contructor takes 2 arguments:
    // gap: Minimum number of seconds between stages.
    // charity: An ethereum address that will receive the deposits of
    //          participants if they do not participate in the vote.
    await deployer.deploy(anonymousVotingContract, 60,
            "0xf9476075c27f7a648dc55cbc42871b39a7b90988");
    await deployer.deploy(localCryptoContract);
    await deployer.deploy(anonVotingController, anonymousVotingContract.address);

    let deployedContract = await anonymousVotingContract.deployed();
    await deployedContract.transferOwnership(anonVotingController.address);

    let htmls = ['stockapp/admin.html', 'stockapp/vote.html', 'stockapp/livefeed.html'];
    console.log("\n   Update your HTMLs");
    console.log("   -----------------");
    let script = "./scripts/update_addresses.sh {TARGET} "
                   + anonVotingController.address + " " + localCryptoContract.address;

    for(let i = 0; i < htmls.length; i++) {
        let formattedScript = script.replace('{TARGET}', htmls[i]);
        console.log(("   > " + htmls[i]  + ": ").padEnd(26, ' ') + formattedScript);
    }
    console.log(("   > All: ").padEnd(26, ' ') + script.replace('{TARGET}', htmls.join()));
    console.log("\n   Make sure to update the abi field in those pages if necessary");
    console.log("\n");
};
