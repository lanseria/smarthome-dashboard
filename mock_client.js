var net = require('net');
var host = '127.0.0.1';
var port = 7894;

var retryTimeout = 3000;    //三秒，定义三秒后重新连接  
var retriedTimes = 0;   //记录重新连接的次数  
var maxRetries = 10;    //最多重新连接十次

var obj = {
  cid: 1,
  data: {
    temperature: {
      status: 1,
      value: 30
    },
    humidity: {
      status: 1,
      value: 75
    }
  },
  time: new Date()
}

var client = net.connect(port, host, function(){
  console.log('Connected to the server.');
  setInterval(function(){
    console.log(obj);
    console.log(JSON.stringify(obj));
    var buf = new Buffer(JSON.stringify(obj));
    //var buf = new Buffer(obj);
    client.write(buf);
  }, 1000)
});
(function connect(){
  client.on('data', function(data){
    console.log(data.toString());
  });
  client.on('close', function() {  
    if(!quitting) {  
      console.log('connection got closed, will try to reconnect');  
      reconnect();  
    }  
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