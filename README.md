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

To automatically update the HTML pages inside `stockapp` with the new contract
addresses, set the `UPDATE_HTML` env variable before executing the command.

```
UPDATE_HTML=1 truffle migrate
```

## Update addresses in stockapp

If you have not set `UPDATE_HTML=1` during migration, html pages under
`stockapp` will still be referencing old versions of the contracts. Update the
pages manually or by using the dedicated script under tools:

```
./tools/update_addresses.sh stockapp/admin.html ADDR_VOTING_CTRL ADDR_LOCAL_CRYPTO
./tools/update_addresses.sh stockapp/vote.html,stockapp/livefeed.html
ADDR_ANON_VOTING ADDR_LOCAL_CRYPTO
```

Note that `admin.html` uses the address of `VotingController` while `vote.html`
and `livefeed.html` use the address of `AnonymousVoting` contract.

The output from a successful `truffle migrate` outputs the commands needed to
update different the contracts.

To get the addresses of the newest versions of the contracts:

```
truffle network
```

## Export contract information

Setting the environment variable `EXPORT_CONTRACTS` to a path of an existing
directory will have the migration export the ABI of each deployed contract into
an own json file inside that directory. A `manifest.json` file will also be
created containing addresses and ABI file name for each of the deployed
contract.

```
EXPORT_CONTRACTS=output/data/ truffle migrate
```

## Test

```
TODO
```

## Run

With your local blockchain network running, you can interact with the contracts
with the provided frontends as follows:

### Administrative frontend (stockapp)

Make sure to update the addresses as described above then just open
`stockapp/admin.html` in your browser.

### Voting frontend

Make sure to export contract information first into `frontend/data`:

```sh
EXPORT_CONTRACTS=frontend/data truffle migrate  # in repo root
```

Then start a webserver with `frontend` as the served directory.

```sh
# using npm: run in repo root `npm install` once, then:
npx serve frontend
```
or

```sh
# using python inside the frontend dir
cd frontend
python3 -m http.server
```



