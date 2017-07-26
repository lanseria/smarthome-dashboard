var parseProto = require('lei-proto');

var DataProces = function(){

}

var dataArray = [];
var Modelbuf = parseProto([
  ['stat', 'string', 4], // (STAT)
  ['total_length', 'uint', 2], // (长度)
  ['cmd', 'uint', 1], // （cmd）
  ['netgateid', 'uint', 6], // （网关ID）
  ['start_flag', 'uint', 1], 
  ['module_count', 'uint', 1], // 模块个数
  // 每个模块了
  ['front', 'uint', 1],// （头）
  ['sub_length', 'uint', 1],// （长度）
  ['d_front', 'uint', 1],
  ['d_type', 'uint', 2], //（设备类型） 
  ['dev_id', 'uint', 6], // （设备ID）
  ['data', 'uint', 1], //  (具体的数据)
  ['sub_crc', 'uint', 1], //0E （crc）
  ['end_flag', 'uint', 1], //CC    （模块数据）
  //结束
  ['total_crc', 'uint', 1], //33  CRC(总)
  ['end', 'string', 3] //45 4E 44 （END）
])
var buf = Modelbuf.encode('STAT', 15, 1, 0, 187, 1, 170, 9, 187, 256, 1099511627776, 1, 14, 204, 51, 'END');
dataArray.push(buf);
dataArray.push(buf);

console.log(Buffer.concat(dataArray));
