var option = {
  host: "127.0.0.1",
  port: 7894
}
var network = require('./network/app.js').network;

var netserver = new network(option);

netserver.start(function(err, server_data){
  console.info(server_data);
  /**
   * server_data里有硬件控制台的ID
   * 采集的数据datas
   * 时间time
   */
  var cencontrol_id = 1;
  var senor_datas = {
    temperature: 30,
    humidity: 75
  };
  var data_time = new Date();
  //分析完成之后
  
});