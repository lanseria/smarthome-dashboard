var net = require('net');
var host = '127.0.0.1';
var port = 8080;

var retryTimeout = 3000;    //三秒，定义三秒后重新连接  
var retriedTimes = 0;   //记录重新连接的次数  
var maxRetries = 10;    //最多重新连接十次
var rcolor = require('./network/rcolor.js').rcolor;
var ruid = require('./network/ruid.js').ruid;

var client = net.connect(port, host, function(){
  console.log('Connected to the server.');
  setTimeout(function(){
    var obj = {
      cid: 1,
      data: {
        temperature: [{
          status: 1,
          value: +ruid().slice(-2)-30,
          devid: 'as1sd'
        }],
        humidity: [{
          status: 1,
          value: +ruid().slice(-2),
          devid: '31j45'
        }]
      },
      time: new Date()
    }
    var parsePorto = require('lei-proto');
    var Modelbuf = parsePorto([
      ['stat', 'string', 4], // (STAT)
      ['total_length', 'uint', 2], // (长度)
      ['cmd', 'uint', 1], // （cmd）
      ['netgateid', 'buffer', 6], // （网关ID）
      ['start_flag', 'buffer', 1], 
      ['module_count', 'uint', 1],
      // 每个模块了
      ['front', 'buffer', 1],// （头）
      ['sub_length', 'uint', 1],// （长度）
      ['d_front', 'buffer', 1],
      ['d_type', 'buffer', 2], //（设备类型） 
      ['dev_id', 'buffer', 6], // （设备ID）
      ['data', 'uint', 1], //  (具体的数据)
      ['sub_crc', 'uint', 1], //0E （crc）
      ['end_flag', 'buffer', 1], //CC    （模块数据）
      //结束
      ['total_crc', 'uint', 1], //33  CRC(总)
      ['end', 'string', 3] //45 4E 44 （END） 
    ])
    var buf = Modelbuf.encode('STAT', 15, 1, new Buffer([00,00,00,00,00,00]), new Buffer([0xbb]), 1, new Buffer([0xaa]), 9, new Buffer([0xbb]), new Buffer([01,00]), new Buffer([01,00,00,00,00,00]), 1, 14, new Buffer([0xcc]), 51, 'END');
    //var buf = new Buffer(obj);
    client.write(buf);
  }, 1000)
});
(function connect(){
  client.on('data', function(data){
    console.log(data.toString());
  });
  client.on('close', function() {
    console.log('connection got closed, will try to reconnect');  
    reconnect();  
  });  
  client.on('end', function(){
    console.log('Server disconnected.');
    console.log();
  })
  function reconnect() {
    if (retriedTimes >= maxRetries) {  
      throw new Error('Max retries have been exceeded, I give up.');  
    }  
    retriedTimes +=1;  
    setTimeout(connect, retryTimeout);  
  } 
})()