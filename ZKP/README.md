Zero-Knowledge Proofs Foundation (WORK IN PROGRESS)

Requirements:
-Node.js & NPM
-zokrates:  curl -LSfs get.zokrat.es | sh
-zokrates-js:	npm install zokrates-js
-web3: npm install web3
-solc: npm install solc@0.6.1 (need 0.6.1, as its the latest compatible compiler for our contracts)
possibly more (might've forgotten some)

Usefull for testing: 
Ganache & Truffle

Usefull knowledge beforehand: 
ZoKrates: https://zokrates.github.io/introduction.html
Solidty Smart Contracts: https://cryptozombies.io/
Ganache: https://www.trufflesuite.com/docs/ganache/quickstart
Truffle: https://www.trufflesuite.com/docs/truffle/quickstart


ZoKrates: How to create your first ZKP and deploy it on the Blockchain
Setup:
1) Create your task as a .zok file.                CONNECTION MIT ID (proove that you are a citizen)
2) in a terminal run: zokrates compile -i yourtask.zok (compiles your .zok file)
3) terminal: zokrates setup (preforms the setup and creates the necessary prover and verifier keys)

Verifier: (has the verfier key)
4) terminal: zokrates export-verifier (creates the solidty contract for you task, you can now deploy this on the blockchain)
5) with the help of viktor.js you can now deploy the contract on the Blockchain (make sure your private Blockchain is running on the same Port) COMPLETED


Proover: (has the proving key and knowledge of what needs to be proved)
4) terminal: zokrates compute-witness -a ...   (... beeing a solution for your task, this generates a witness to create your Proof of Knowledge) CONNECTION MIT ID
5) terminal: zokrates generate-proof (generates a proof of computation)
6) with the help of peggy.js we can utilise the proof and do stuff (WORK IN PROGRESS, RESEARCHING)

