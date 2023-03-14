const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket.Server({ host: '0.0.0.0', port: 8555 });
var i = 0;
// Open a writable stream to the local file

// When a new websocket connection is established
ws.on('connection', function connection(ws) {
    console.log('WebSocket connection established');
    //create a new folder for every new connection

    var dir = './' + "siva_sm31_"+i;
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    i++;
    var stream1 = fs.createWriteStream(dir + '/acce.csv');
    var stream2 = fs.createWriteStream(dir + '/gyro.csv');
    var stream3 = fs.createWriteStream(dir + '/magnet.csv');

    // When a message is received on the websocket connection
    ws.on('message', function incoming(data) {
        // console.log('Received message:', data);
        data = data.toString();
        data = data.split(',');
        var d = new Date();
        data[0] = d.getTime();
        console.log(data);
        stream2.write(data[0] + ',' + data[1] + ',' + data[2] + ',' + data[3] +'\n');
        stream1.write(data[0] + ',' + data[4] + ',' + data[5] + ',' + data[6] +'\n');
        stream3.write(data[0] + ',' + data[7] + ',' + data[8] + ',' + data[9] +'\n');
        // Write the received data to the local file
    });
});
