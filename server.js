<<<<<<< HEAD
const express = require('express');
const app = express();
const server = require('http').Server(app);
const url = require('url');

const WebSocket = require('ws');

const port = parseInt(process.argv.slice(2));

const express_config= require('./config/express.js');

express_config.init(app);

const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });
=======
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
const WebSocket = require('ws')
var values = {}
var mappings = require('./public/mappings.js');
>>>>>>> 9e3efa42ce6b3ed656582881c38d6004c5c035f2



var cameraArray={};

<<<<<<< HEAD
//edge websocket
wss1.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    wss2.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// hub
wss2.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	// nothing here should be received
    console.log('received wss2: %s', message);
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/hub') {
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } else if (pathname === '/client') {
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

app.get("/", function (req, res) {
    res.redirect("index.html")
});

app.use(express.static(__dirname + '/public'));


server.listen(port, () => {
	  console.log(`App listening at http://localhost:${port}`)
=======
wss.on('connection', ws => {
  ws.on('message', message => {
    // console.log(`Received message => ${message}`)
     wss.clients.forEach(function each(client) {
       client.send(`${message}`);
     });

     // try{
     //    var obj = JSON.parse(message);
     //    console.log(obj);
     //    mappings.handleWSMessage(obj);
     // }
     // catch(e){
     // }
  })
  ws.send('start');
>>>>>>> 9e3efa42ce6b3ed656582881c38d6004c5c035f2
})


