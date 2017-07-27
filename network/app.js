var net = require('net')
var server = null;
var socketsMap = new Map();
var limit = 1000;
var socketid = 0;

function network(options){
  if (!(this instanceof network)) {
    return new network(options);
  }
  options = options || {};
  if (!options.host || !options.port) {
    throw new Error('host or port need!');
  }
  this.host = options.host;
  this.port = options.port;
  this.clients = [];
}

network.prototype.send = function(client, data){
  client.socket.write(data)
}

network.prototype.recv = function(client, cb){
  client.socket.on('data', data => {
    var response = {
      client: client,
      data: data
    }
    cb(null, response);
  })
}

network.prototype.connect = function(cb){
  server.on('connection', socket => {
    var client = {
      ip: socket.remoteAddress,
      port: socket.remotePort,
      socket: socket
    }
    this.clients.push(client);
    this.recv(client, cb)
    socket.on('end', () => {
      console.log('Client disconnected.')
    })
  })
}

network.prototype.start = function(cb){
  console.info(' > ' + this.host + ' Server is running on port ' + this.port)
  server = net.createServer();
  this.connect(cb);
  server.on('error', function(err){
    console.log(' > Server error:', err.message);
  })
  server.on('close', function(){
    console.log(' > Server closed');
  })
  server.listen(this.port, this.host);
}

exports.network = network;