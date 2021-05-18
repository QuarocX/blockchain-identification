const { initialize } = require('zokrates-js/node');
const fs = require('fs-extra');
const Web3 = require('web3');
const solc = require('solc');  // solidity compiler bindings


let VICTOR_ADR = '0xe6d01C85504016E5bb7636835d279ffB07af4b5e'
let PEGGY_ADR = '0x97026a8157f39101aefc4A81496C161a6b1Ce46A'

function writeObject(filename,object) {
  fs.writeFileSync(filename, JSON.stringify(object));
  console.log('Write to ...');
  console.log(filename);
} 

function readObject(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function importResolver(location, path) {
  // implement your resolving logic here
  return { 
    source: "def main() -> (): return", 
    location: path 
  };
}

initialize().then((zokratesProvider) => {

//compile verifier
var input = {
    language: 'Solidity',
    sources: {
      'verifier.sol': {
        content: fs.readFileSync("verifier.sol","utf8")
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };


  // structure of compile result: https://solidity.readthedocs.io/en/v0.6.6/using-the-compiler.html
  let compiled = JSON.parse(solc.compile(JSON.stringify(input)),1);
  fs.outputJsonSync('verifier.json', compiled.contracts['verifier.sol']['Verifier']);

  // deploy verifier on ganache
  let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'), null, { transactionConfirmationBlocks: 1 /* This is the critical part */ });
  let source = fs.readFileSync("verifier.json");
  let contract = JSON.parse(source);

  let abi = contract.abi;
  let code = '0x' + contract.evm.bytecode.object;



  let Contract = new web3.eth.Contract(abi);
  Contract.options.data = code;

  Contract.deploy()
  .send({
    from: VICTOR_ADR, // add address here
    gas: 1500000,
    gasPrice: '30000000000000'
  })
  .then(function(newContractInstance){
      console.log(newContractInstance.options.address) // instance with the new contract address
      writeObject('contractAddress.out', newContractInstance.options.address)
  });

});
