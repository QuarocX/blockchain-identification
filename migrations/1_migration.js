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

    let htmls = {
        'stockapp/admin.html': [anonVotingController.address, localCryptoContract.address],
        'stockapp/vote.html': [anonymousVotingContract.address, localCryptoContract.address],
        'stockapp/livefeed.html': [anonymousVotingContract.address, localCryptoContract.address],
        'stockapp/preregistration.html': [anonVotingController.address, ""]
    };
    let cmd = [
        './tools/update_addresses.sh',
        null, // target file(s), set later
        null,
        null
    ];

    console.log("\n   Update your HTMLs");
    console.log("   -----------------");
    const { exec } = require('child_process');

    for (const [key, value] of Object.entries(htmls)) {
        cmd[1] = key;
        cmd[2] = value[0];
        cmd[3] = value[1];
        let formattedScript = cmd.join(' ');
        console.log(("   > " + key  + ": ").padEnd(29, ' ') + formattedScript);

        if (process.env.UPDATE_HTML) {
            exec(cmd.join(' '));
        }
    }

    console.log(("   > Auto patched: ").padEnd(29, ' ') + (process.env.UPDATE_HTML ? 'yes' : 'no'));
    console.log("\n   Make sure to update the abi field in those pages if necessary");
    console.log("\n");
};
