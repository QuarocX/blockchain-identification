const { initialize } = require('zokrates-js/node');
const fs = require('fs-extra');
const Web3 = require('web3');

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
    location: path,
  };
}

initialize().then((zokratesProvider) => {

//UNFINESHED UNDOCUMENTED CODE - MIGHT DELETE THINGS

  let proof = fs.readFileSync('proof.json')
  
  let contractAddress = readObject('contractAddress.out');
  console.log(contractAddress)

  let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'), null, { transactionConfirmationBlocks: 1 /* This is the critical part */ });
  let source = fs.readFileSync("verifier.json");
  let contract = JSON.parse(source);

  let Contract = new web3.eth.Contract(contract.abi, contractAddress);

  fs.outputJsonSync('proof.json', JSON.parse(proof))

  let p = JSON.parse(proof).proof
  console.log(contract.abi)
  // console.log(JSON.parse(proof))

  let inputs = JSON.parse(proof).inputs;

  console.log(inputs)


  // for (let i in Contract.methods.contract) console.log(i)
});
