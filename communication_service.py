import requests
import time
import argparse

#TODO: MAKE THIS WHOLE THING TWO SEPERATE CONTROLLERS

def main(args):

    yin_swagger = "http://localhost:11001"  
    yang_swagger = "http://localhost:11003"  

    if args['build_initial_connection']:
        connect_agents(yin_swagger, yang_swagger)

    if args['send_basic_message']:
        yin_conn_id = get_connections(yin_swagger).json()['results'][0]['connection_id']
        yang_conn_id = get_connections(yang_swagger).json()['results'][0]['connection_id']

        print('Sending message...')
        msg_response = send_basic_message(yang_swagger, yang_conn_id, 'Hello yin, was geht?')
        print('Message has been sent.')


def send_basic_message(endpoint, conn_id, message):
    '''
    Send a basic message to a connection
    '''
    url = f'{endpoint}/connections/{conn_id}/send-message'
    json_message = {"content": message}

    print(url)
    print(json_message)

    response = requests.post(url, json=json_message)
    
    assert(response.status_code == 200)

    return response

    
def connect_agents(sender_endpoint, receiver_endpoint):
    '''
    A key observation to make here. The "copy and paste" we are doing here 
    from Faber's agent to Alice's agent is what is called an "out of band" 
    message. Because we don't yet have a DIDComm connection between the two 
    agents, we have to convey the invitation in plaintext (we can't encrypt 
    it - no channel) using some other mechanism than DIDComm. With mobile 
    agents, that's where QR codes often come in. Once we have the invitation 
    in the receivers agent, we can get back to using DIDComm.
    '''
    yin_inv_response, invitation, yin_inv_cid = create_invitation(sender_endpoint)
    yang_inv_response, yang_inv_cid = receive_invitation(receiver_endpoint, invitation)
    yang_req_response, yang_req_cid = accept_invitation(receiver_endpoint, yang_inv_cid)

    time.sleep(5)

    connections = get_connections(sender_endpoint)
    request_con_id = connections.json()['results'][0]['connection_id']
    print(request_con_id)
    yin_req_response, yin_req_cid = accept_request(sender_endpoint, request_con_id)
    print(yin_req_cid)


def create_invitation(sender_endpoint):
    '''
    Create a new connection invitation
    '''
    data = {}
    params = {'alias': 'sender_ali'}
    url = f'{sender_endpoint}/connections/create-invitation'
    response = requests.post(url, json=data, params=params)

    assert(response.status_code == 200)
    response_json = response.json()

    connection_id = response_json['connection_id']
    invitation = response_json['invitation']

    return response, invitation, connection_id


def receive_invitation(receiver_endpoint, invitation):
    '''
    Receive a new connection invitation
    '''
    params = {'alias': 'receiver_ali'}
    url = f'{receiver_endpoint}/connections/receive-invitation'
    response = requests.post(url, json=invitation, params=params)
    
    assert(response.status_code == 200)
    response_json = response.json()

    connection_id = response_json['connection_id']

    return response, connection_id


def accept_invitation(receiver_endpoint, connection_id):
    '''
    Accept the connection invitation
    '''
    # params = {'conn_id': connection_id}
    url = f'{receiver_endpoint}/connections/{connection_id}/accept-invitation'
    response = requests.post(url)
    
    assert(response.status_code == 200)
    response_json = response.json()

    connection_id = response_json['connection_id']

    return response, connection_id


def accept_request(sender_endpoint, connection_id):
    '''
    Accept a stored connection request
    '''
    # params = {'conn_id': connection_id}
    url = f'{sender_endpoint}/connections/{connection_id}/accept-request'
    response = requests.post(url)
    
    assert(response.status_code == 200)
    response_json = response.json()

    connection_id = response_json['connection_id']

    return response, connection_id


def get_connections(endpoint):
    '''
    Query agent-to-agent connections
    '''
    connections = requests.get(f'{endpoint}/connections')

    return connections


def clear_all_connections(endpoint):
    '''
    Deletes all connections
    '''
    connections = get_connections(endpoint).json()['results']

    for connection in connections:
        requests.delete(f'{endpoint}/connections/{connection["connection_id"]}')


def add_arguments():
    ap = argparse.ArgumentParser(prog='YinYang Controllers', 
            description='Pair of controllers for two agents; they will be seperated.')
    ap.add_argument('-bic', '--build_initial_connection', default=0, type=int, 
            help='build the initial connection between agents.')
    ap.add_argument('-sbm', '--send_basic_message', default=0, type=int, 
            help='send example basic message.')

    args = vars(ap.parse_args())
    return args

if __name__ == "__main__":
    args = add_arguments()
    main(args)
