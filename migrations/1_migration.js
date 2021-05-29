
const CONTRACT_NAMES = [
    'AnonymousVoting', 'LocalCrypto', 'VotingController', 'IDUnionAuthenticator'
];

const contracts = {};

for (let item of CONTRACT_NAMES) {
    contracts[item] = artifacts.require(item);
}

module.exports = async function (deployer) {
    // AnonymousVoting's contructor takes 2 arguments:
    // gap: Minimum number of seconds between stages.
    // charity: An ethereum address that will receive the deposits of
    //          participants if they do not participate in the vote.
    await deployer.deploy(contracts.AnonymousVoting, 120,
            "0xf9476075c27f7a648dc55cbc42871b39a7b90988");
    await deployer.deploy(contracts.LocalCrypto);
    await deployer.deploy(contracts.IDUnionAuthenticator)
    await deployer.deploy(contracts.VotingController,
        contracts.AnonymousVoting.address, contracts.IDUnionAuthenticator.address);

    let deployedContract = await contracts.AnonymousVoting.deployed();
    await deployedContract.transferOwnership(contracts.VotingController.address);

    let htmls = {
        'stockapp/admin.html': [contracts.VotingController.address, contracts.LocalCrypto.address],
        'stockapp/vote.html': [contracts.AnonymousVoting.address, contracts.LocalCrypto.address],
        'stockapp/livefeed.html': [contracts.AnonymousVoting.address, contracts.LocalCrypto.address],
        'stockapp/preregistration.html': [contracts.VotingController.address, ""]
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

    /** Summary **/
    console.log("\n\n   Contracts Summary");
    console.log("   -----------------");

    for (const [key, value] of Object.entries(contracts)) {
        console.log(("   > " + key  + ": ").padEnd(29, ' ') + value.address);
    }

    /** Export data **/
    if (process.env.EXPORT_CONTRACTS) {
        const fs = require('fs');
        const path = require('path');

        const export_dir = process.env.EXPORT_CONTRACTS;
        console.log("\n\n   Exported Files");
        console.log("   -----------------");
        // abi
        let manifest = {};
        for (const [key, contract] of Object.entries(contracts)) {
            let target_path = path.join(export_dir, key + '.json');
            fs.writeFileSync(target_path, JSON.stringify(contract.abi));
            manifest[key] = {
                'abi': key + '.json',
                'address': contract.address
            };
            console.log(("   > " + key  + ": ").padEnd(29, ' ') + target_path);
        }

        const manifest_path = path.join(export_dir, 'manifest.json')
        fs.writeFileSync(manifest_path, JSON.stringify(manifest, null, 2));
        console.log(("   > manifest.json: ").padEnd(29, ' ') + manifest_path);
    }
    console.log("\n");
};
