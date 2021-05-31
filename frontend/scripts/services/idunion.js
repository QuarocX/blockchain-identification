(function(){
    class IDUnionAuthenticator {
        constructor(contractLoader, _address, _abi) {
            this.promise = contractLoader.load(_address, _abi);
            this.promise.then((contract) => {
                this.contract = contract;
            });
			this.activeAccount = null;
            this.listeners = [];
        }
        ready() {
            return this.promise;
        }
		setActiveAccount(account) {
			this.activeAccount = account;
		}
        on(eventName, callback) {
            this.contract.events[eventName](null, (err, ev) => {
                if (err) {
                    callback(err, ev);
                } else {
                    callback(null, ev.returnValues);
                }
            });
        }
        async getRequestByConnectionId(connectionId) {
            let authRequest = await this.contract.methods
                .getAuthenticationRequest(connectionId).call();

            return {
                addr: authRequest.addr,
                connectionId: authRequest.connectionId,
                connectionUrl: authRequest.connectionUrl,
                sender: authRequest.sender,
                status: authRequest.status
            };
        }
        async requests() {
            let count = await this.contract.methods.getNumberOfConnections()
                .call();
            let requests = [];
            for (let i = 0; i < count; i++) {
                let connId = await this.contract.methods.connectionIds(i)
                    .call();
                requests.push(await this.getRequestByConnectionId(connId));
            }
            return requests;
        }
    }

    window.app.ng.provider('idUnionAuthenticator', function() {
        var address, abi;

        this.setParams = (_address, _abi) => {
            address = _address;
            abi = _abi;
        }
 
        this.$get = (contractLoader) => {
            return new IDUnionAuthenticator(contractLoader, address, abi);
        }
    });
})();
