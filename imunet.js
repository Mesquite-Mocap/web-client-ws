const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket.Server({ host: '0.0.0.0', port: 8555 });

// Open a writable stream to the local file
const stream = fs.createWriteStream('data.txt');

// When a new websocket connection is established
ws.on('connection', function connection(ws) {
    console.log('WebSocket connection established');

    // When a message is received on the websocket connection
    ws.on('message', function incoming(data) {
        console.log('Received message:', data);

        // Write the received data to the local file
        stream.write(data + '\n');
    });
});
