# blockchain-identification

The repository extends the work provided by [Patrick
McCorry](https://github.com/stonecoldpat/anonymousvoting) to allow an automatic
determination of eligibility to participate in the deployed voting contract.

The elligibility is determined by verifying the identity of participating
individual through interactions with IDUnion's hyperledger.

## Contract Overview

- [AnonymousVoting](contracts/AnonymousVoting.sol): imported from
  [stonecoldpat/anonymousvoting](https://github.com/stonecoldpat/anonymousvoting)
- [LocalCrypto](contracts/LocalCrypto.sol): imported from
  [stonecoldpat/anonymousvoting](https://github.com/stonecoldpat/anonymousvoting)

## Environment Setup

Install truffle globally to be able to have truffle binary in PATH

```
npm install -g truffle
```

To install any necessary dependencies, execute the following in project root:

```
npm install
```

## Compile

Compiled contract swill be found at `build/` directory. Compilation of the imported
contracts produce a lot of warnings due to usage or `jump` and function
mutability. This should be fine and can be ignored.

```
truffle compile
```

## Deploy

For development you would need a locally running ethereum blockchain. Ganache,
geth, and truffle itself can provide that.

Run a local blockchain using truffle:

```
truffle develop
```

Migrate the built contracts. Make sure to pass a valid `charity` address to
`AnonymousVoting`'s contract migration.

```
truffle migrate
```

## Test

```
TODO
```

## Run

```
TODO
```


