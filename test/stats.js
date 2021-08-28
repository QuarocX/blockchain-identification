const IDUnionAuthenticator = artifacts.require("IDUnionAuthenticator");
const VotingController = artifacts.require("VotingController");
const AnonymousVoting = artifacts.require("AnonymousVoting");
const { exec } = require("child_process");
const fs = require('fs');
const COUNT_VOTERS = 4;
var path = require('path');

const CONNECTION_URL = "http://192.168.178.6:8003?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiMDUxNTBhNDMtYzg2ZS00MzBmLTg5ZTMtNWE0ZGRhMWI2MmQyIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwOi8vMTkyLjE2OC4xNzguNjo4MDAzIiwgInJlY2lwaWVudEtleXMiOiBbIk5BOE1UVWFhVlhVelR0ZzVkUERRd1VYdUN2WUdBOHZOdFBYUE5qTnVoR3oiXSwgImxhYmVsIjogIlZlcmlmaWVyIn0=";

function chunkSubstr(str, size) {
      const numChunks = Math.ceil(str.length / size)
      const chunks = new Array(numChunks)

      for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
              chunks[i] = str.slice(o, o+size)
            }

      return chunks
}

contract("VotingController+IDUnionAuthenticator", accounts => {
    let authenticator;
    let votingController;
    let preTestBalances;
    let totalPreTestsBalances;
    let totalPostTestsBalances;

    let readProof = function() {
        var filePath = path.join(__dirname, 'proof.jzon');
        return fs.readFileSync(filePath);
    }

    let getBalances = async function() {
        let balances = {};
        for(var i = 0;  i < accounts.length; i++) {
            var balance = await web3.eth.getBalance(accounts[i]);
            balance = web3.utils.fromWei(balance, 'ether');
            balances[accounts[i]] = balance;
        }
        return balances;
    }

    let executePreRegister = async function(nMembers) {
        //auth_capture_events('UserAuthenticationRequired');
        for (var i = 0; i < nMembers; i++) {
            await votingController.preRegister( { from:accounts[i+1] } );
        }
    };

    let establishConnections = async function() {
        let events = await authenticator.getPastEvents('AuthenticationRequested', 
            {fromBlock: 0, toBlock: "latest"});
        for (var i = 0; i < events.length; i++) {
            let requestId = events[i].args.requestId;
            let connId = `connection_${i}`;
            let connectionUrl = CONNECTION_URL;
            await authenticator.startUserAuthentication(requestId, connId, connectionUrl,
                { from: accounts[i+1]})
        }
    }

    let setConnectionEstablished = async function(n) {
        for (var i = 0; i < n; i++) {
            let connId = `connection_${i}`;
            await authenticator.connectionEstablished(connId, { from: accounts[i+1]})
        }
    }

    let putProofs = async function(n) {
        let chunks = chunkSubstr(readProof(), 4000);
        for (var i = 0; i < n; i++) {
            let connId = `connection_${i}`;
            for (var j = 0; j < chunks.length - 1; j++) {
                await authenticator.setAuthenticationResult(
                    connId, chunks[j], false, {from: accounts[i+1]});
            }
            chunks[chunks.length - 1][0] = i;
            await authenticator.setAuthenticationResult(
                connId, chunks[chunks.length - 1], true, {from: accounts[i+1]});
        }
    }

    let validateAuthenticationResult = async function(n) {
        for (var i = 0; i < n; i++) {
            let connId = `connection_${i}`;
            await votingController.validateAuthenticationResult(connId, true, {from: accounts[0]});
        }
    } 

    beforeEach(async () => {
        preTestBalances = await getBalances();
        if (totalPreTestsBalances == null) {
            totalPreTestsBalances = preTestBalances;
        }
        authenticator = await IDUnionAuthenticator.deployed();
        votingController = await VotingController.deployed();
    });

    afterEach(async () => {
        let postTestBalances = await getBalances();
        totalPostTestsBalances = postTestBalances;
        showBalanceSummary(preTestBalances, postTestBalances);
        console.log('\nTotal balance diff from start to current step:\n');
        showBalanceSummary(totalPreTestsBalances, totalPostTestsBalances);
        console.log('----------------------------')
    });

    function showBalanceSummary(totalPre, totalPost) {
        let sub = 10;
        for(var i = 0; i < accounts.length; i++) {
            let account = accounts[i];
            if (totalPost[account] != totalPre[account]) {
                var pre = totalPre[account];
                var post = totalPost[account];
                var diff = pre - post;
                pre = pre.toString().substring(0, sub).padEnd(sub, " ");
                post = post.toString().substring(0, sub).padEnd(sub, " ");
                diff = diff.toString().substring(0, sub).padEnd(sub, " ");
                let acctName = i == 0 ? "Initiator" : "Voter"
                console.log(`${acctName} ` + (i).toString().padStart(2, "0") +
                    ": " + pre +
                    " - " + post +
                    " =  " + diff
                    );
            }
        }
    }

    it(`Step 0: ${COUNT_VOTERS} voters Execute preRegister`, async() => {
        await executePreRegister(COUNT_VOTERS);
    });
    it(`Step 1: ${COUNT_VOTERS} voters scan qr code and wait for connection`, async() => {
        await establishConnections();
    });
    it(`Step 2: ${COUNT_VOTERS} voters have their connections established`, async() => {
        await setConnectionEstablished(COUNT_VOTERS);
    });
    it(`Step 3: ${COUNT_VOTERS} put their proofs to the blockchain`, async() => {
        await putProofs(COUNT_VOTERS);
    });
    it(`Step 4: Initiator validates proofs for ${COUNT_VOTERS} voters`, async() => {
        await validateAuthenticationResult(COUNT_VOTERS);
    });
});
