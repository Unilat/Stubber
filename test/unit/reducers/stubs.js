const stubs = [
    {
        'disabled': true,
        'name': 'Calvin\'s Folder',
        'open': false,
        'stubs': [
            {
                'disabled': true,
                'folder': 'Calvin\'s Folder',
                'headers': 'Host: api-dev.nwie.net\nConnection: keep-alive\nX-Nw-Transaction-Id: 059884530700543638838592\nAuthorization: Bearer KhQ7IgWMXQCbJm0aksoFf4X0B5Av\nContent-Type: application/json\nAccept: application/json, text/plain, */*\nUser-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1\nclient_id: lBeZrJjZF6JwARUn2vBF8wY71AHWGxUp\nReferer: http://localhost:8100/\nAccept-Encoding: gzip, deflate, br\nAccept-Language: en-US,en;q=0.8,pt;q=0.6',
                'method': 'GET',
                'name': '/agents 401',
                'response': '{\n    "userMessage": "The user is not authorized to make this request",\n    "developerMessage": "Invalid Access Token",\n    "correlationId": "123456"\n}',
                'status': '666',
                'url': 'calvin is dope'
            },
            {
                'folder': 'Calvin\'s Folder',
                'headers': 'date: Tue, 14 Nov 2017 14:32:29 GMT\nserver: nginx\naccess-control-allow-origin: *\nx-powered-by: Servlet/3.0\ntransfer-encoding: chunked\naccess-control-allow-methods: GET, POST, OPTIONS\ncontent-language: en-US\nx-backside-transport: OK OK,OK OK\naccess-control-max-age: 3628800\nx-global-transaction-id: fbc195025a0afe7d46a865a1\nconnection: Keep-Alive\ncontent-type: application/json\naccess-control-allow-headers: origin, x-requested-with, accept, X-Nw-Transaction-Id, client_id, content-type\n',
                'method': 'GET',
                'name': 'A new imported stub',
                'response': '{"account":[]}',
                'status': '200',
                'url': 'https://api-dev.nwie.net/customerrelationshipmanagement/mobilewebengine/v1/customers/9CC73BF92987420DAEAEBA27AC414FF5/accounts/investment'
            }
        ]
    },
    {
        'name': 'Imported New Folder',
        'open': true,
        'stubs': [
            {
                'disabled': true,
                'folder': 'Imported New Folder',
                'headers': 'access-control-allow-origin: http://localhost:8100\naccess-control-allow-credentials: true\ncontent-length: 0\ncontent-type: text/plain\n',
                'method': 'GET',
                'name': '/agents empty',
                'response': '{"agent":[]}',
                'status': '200',
                'url': 'https://api-dev.nwie.net/customerrelationshipmanagement/mobilewebengine/v1/customers/9CC73BF92987420DAEAEBA27AC414FF5/agents'
            }
        ]
    }
];

export default stubs;