# blockchain-identification

blockchain-identification



## Aries Communication

### Do in this order

./yin\_agent.sh

./yang\_agent.sh

docker run --rm -p 9001:9001 yin\_webhook

docker run --rm -p 9003:9003 yang\_webhook

python communication\_service.py -bic 1 -sbm 1

### Useful stuff 

To see the containers and their ip addresses: docker inspect bridge

To see the ports in LISTEN state: netstat -tulpn | grep LISTEN
