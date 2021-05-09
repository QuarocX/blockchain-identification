from flask import Flask
from flask import request
from flask import Response
app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return 'Hello, This is Home for yin!'


@app.route('/webhooks/', methods=['GET', 'POST'])
def webhooks():
    return 'Hello, This is the webhooks main page for yin!'


@app.route('/webhooks/topic/ping/', methods=['GET', 'POST'])
def webhooks_ping():
    return 'Hello, Webhooks is pinged for yin!'


@app.route('/webhooks/topic/basicmessages/', methods=['GET', 'POST'])
def webhooks_topic_basicmessages():
    if request.method == 'POST':
        print(request.json['content'])
        print(request)
        print('REQUEST TO webhooks/topic/basicmessages')
        return Response("{'a': 'b'}", status=200, mimetype='application/json')
    else:
        return 'Hello, This is the webhooks topic page for the basic messages for yin!'


@app.route('/webhooks/topic/connections/', methods=['GET', 'POST'])
def webhooks_topic_connections():
    if request.method == 'POST':
        print(request.disable_data_descriptor)
        print('REQUEST TO webhooks/topic/connections')
        return Response("{'a': 'b'}", status=200, mimetype='application/json')
    else:
        return 'Hello, This is the webhooks topic page for the connections for yin!'


@app.route('/webhooks/topic/connections/<conn_id>/', methods=['GET', 'POST'])
def webhooks_topic_connection_id(conn_id):
    if request.method == 'POST':
        return request.json()
    else:
        return 'Hello, This is the webhooks topic page for the connection %s for yin!' % conn_id


if __name__ == '__main__':
   app.run(host='0.0.0.0', port=9001)
