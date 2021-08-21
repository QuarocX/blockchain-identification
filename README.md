# blockchain-identification

The repository extends the work provided by [Patrick
McCorry](https://github.com/stonecoldpat/anonymousvoting) to allow an automatic
determination of eligibility to participate in the deployed voting contract.

The elligibility is determined by verifying the identity of participating
individual through interactions with IDUnion's hyperledger.

## Design

The repository consists of two entities namely the initiator and verifier.
The initiator is the admin side and includes the blockchain related files and 
the admin frontend. The verifier includes the voter frontend.

## Testing

The verifier and the initiator runs locally in the same machine.

To setup: 

```
./local_setup.sh
```

To run:

```
./local_run.sh
```

## Production

The initiator runs in the server in the admin side, and the verifier runs in
the voter side.

In production, run the appropriate commands for the initiator and the verifier 
in `local_setup.sh` and `local_run.sh` seperately in the admin and the voter side.

