# blockchain-identification

blockchain-identification



## Aries Communication

### Do in this order

./yin_agent.sh

./yang_agent.sh

docker build -t yin_webhook yin_webhook/
docker run --rm -p 9001:9001 yin_webhook

docker build -t yang_webhook yang_webhook/
docker run --rm -p 9003:9003 yang_webhook

python communication_service.py -bic 1 -sbm 1

### Useful stuff 

To see the containers and their ip addresses: docker inspect bridge

To see the ports in LISTEN state: netstat -tulpn | grep LISTEN
