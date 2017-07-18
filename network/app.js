var net = require('net')

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
}

network.prototype.start = function(cb){
  console.info(' > ' + this.host + ' Server is running on port ' + this.port)
  var server = net.createServer();
  /**
  * 异常处理
  */
  process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
  });
  server.on('connection', socket => {
    var client = socket.remoteAddress + ':' + socket.remotePort
    console.info(' > Connected to ' + client)

    socket.on('data', data => {
      var response = data;
      cb(null, response);
      //console.log(data.toString())
      // socket.write('hello client!')
    })
    // socket.on('end', () => {
    //   console.log('Client disconnected.')
    // })
  })
  server.on('error', function(err){
    console.log(' > Server error:', err.message);
  })
  server.on('close', function(){
    console.log(' > Server closed');
  })
  server.listen(this.port, this.host);
}

exports.network = network;