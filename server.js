var option = {
  host: "127.0.0.1",
  port: 8080
}
var network = require('./network/app.js').network;

var TcpBuffer = require('./bufferprocess/app.js');

var netserver = new network(option);
/**
* 异常处理
*/
process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});
netserver.start(function(err, server_data){
  // console.info(server_data.data);
  var tcpbuffer = new TcpBuffer({type: 'recv'});
  // tcpbuffer.crc8Check(server_data.data);
  // tcpbuffer.buildModel(server_data);
  tcpbuffer.rolling(server_data.data);
  // var obj  = { 
  //   cmd: 1,
  //   netgateid: new Buffer([00, 00, 00, 00, 00, 00]),
  //   modules: [ { 
  //       dType: new Buffer([01,00]),
  //       devId: new Buffer([01, 00, 00, 00, 00, 00]),
  //       data: 1 
  //     } 
  //   ] 
  // };
  // do something Emmm...
  // var tcpbuffer = new TcpBuffer({type: 'send'});
  // var data = tcpbuffer.setBuild(obj);
  // this.send(client, data);
});