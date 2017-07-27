var parseProto = require('lei-proto');
var CRC = require('./crc8');

function TcpBuffer(options) {
  if (!(this instanceof TcpBuffer)) {
    return new TcpBuffer(hexData);
  }
  options = options || {};
  this.type = options.type;// recv send

  this.flag_STAT = options.flag_STAT || 'STAT';
  this.flag_start = options.flag_start || new Buffer([0xbb]);
  this.flag_front = options.flag_front || new Buffer([0xaa]);
  this.flag_d_start = options.flag_d_start || new Buffer([0xbb]);
  this.flag_reer = options.flag_reer || new Buffer([0xcc]);
  this.flag_END = options.flag_END || 'END';
  
  this.Modelbuf = {};
  this.crc = true;
  this.tempObj = {};
  this.transObj = {};

  this.total_buf_length = 0;

  this.bypelength = 0;

  this.cmd = 0;

  this.totalcrc = 0;

  this.module_count = 0;
}
/**
 * CRC8校验
 */
TcpBuffer.prototype.crc8Check = function(hexData){
  var module_count = hexData.readUInt8(14);
  var len = hexData.length - 4;
  var buf_arr = [];
  for(let i = 4;i < len;i++){
    // console.log(hexData[i])
    buf_arr.push(new Buffer([hexData[i]]))
  }
  var buf = Buffer.concat(buf_arr);
  if(! (CRC.CRC8(buf) == hexData[len]) )
  {
    this.crc = false;
  }
  else{
    buf_arr = [];
    for(let i = 0;i < module_count; i++){
      for(let j = 16 + i * 14;j < 27 + i * 14; j++){
        buf_arr.push(new Buffer([hexData[j]]))
      }
      buf = Buffer.concat(buf_arr);
      if(! (CRC.CRC8(buf) == hexData[27+(module_count-1)*14]) )
      {
        this.crc = false;
      }
    }
  }
  // console.log(this.crc);
}
/**
 * 构建对应数据容器
 */
TcpBuffer.prototype.buildModel = function(hexData){
  var moduleCount = hexData.readUInt8(14);
  var model_arr = [];
  model_arr.push(
    ['stat', 'string', 4], // (STAT)
    ['totalLength', 'uint', 2], // (长度)
    ['cmd', 'uint', 1], // （cmd）
    ['netgateId', 'buffer', 6], // （网关ID）
    ['startFlag', 'buffer', 1], 
    ['moduleCount', 'uint', 1] // 模块个数)
  );
  for(let i = 0; i < moduleCount; i++){
    model_arr.push(
      // 每个模块了
      ['front_'+i, 'buffer', 1],// （头）
      ['subLength_'+i, 'uint', 1],// （长度）
      ['dFront_'+i, 'buffer', 1],
      ['dType_'+i, 'buffer', 2], //（设备类型） 
      ['devId_'+i, 'buffer', 6], // （设备ID）
      ['data_'+i, 'uint', 1], //  (具体的数据)
      ['subCrc_'+i, 'uint', 1], //0E （crc）
      ['endFlag_'+i, 'buffer', 1] //CC    （模块数据）
    )
  }
  model_arr.push(
    ['totalCrc', 'uint', 1], //33  CRC(总)
    ['end', 'string', 3] //45 4E 44 （END）
  )
  this.Modelbuf = parseProto(model_arr);
  this.tempObj = this.Modelbuf.decode(hexData);
}
/**
 * 接受数据
 */
TcpBuffer.prototype.recv = function (){
  this.transObj = {
    cmd: this.tempObj.cmd,
    netgateId: this.tempObj.netgateId,
    modules: []
  }
  var m = new Map();
  for (var prop in this.tempObj) {
    var str_arr = prop.split('_');
    if (/^[0-9]*$/g.test(str_arr[1])){
      var num = str_arr[1];
      var s_prop = str_arr[0];
      if(s_prop == 'subLength'||s_prop == 'dFront'||s_prop=='subCrc'||s_prop=='endFlag'){
        continue;
      }
      if (m.has(num)) {
        this.transObj.modules[num][s_prop] = this.tempObj[prop];
      }else{
        m.set(num, 1);
        var arr = new Object();
        this.transObj.modules.push(arr);
      }
    }
  }
  // console.log(this.transObj);
}
/**
 * 轮询的方式去读取数据
 */
TcpBuffer.prototype.rolling = function(hexData){
  var n = hexData.length;
  var i = 0, step = 0;
  while(n){
    i = hexData.length - n;
  
    switch (step) {
      case 0:
        var len = this.flag_STAT.length;
        var temp_buf = [];
        for (let index = i; index < len+i; index++) {
          temp_buf.push(Buffer.from([hexData[index]]))
        }
        var t = Buffer.concat(temp_buf)
        if(t.toString() == this.flag_STAT){
          step++;
          n -= len;
        }else{
          return false;
        }
        break;
      case 1:
        temp_buf = [];
        temp_buf.push(Buffer.from([hexData[i]]));
        temp_buf.push(Buffer.from([hexData[i+1]]));
        var t = Buffer.concat(temp_buf)
        this.bypelength = t.readUInt16BE();
        console.log(this.bypelength);
        n -= 2;
        step++;
        break;
      case 2:
        temp_buf = [];
        temp_buf.push(Buffer.from([hexData[i]]));
        var t = Buffer.concat(temp_buf)
        this.cmd = t.readInt8();
        n--;
        step++;
        break;
      case 3:
        temp_buf = [];
        var len = 6;
        for (let index = i; index < len+i; index++) {
          temp_buf.push(Buffer.from([hexData[index]]))
        }
        var t = Buffer.concat(temp_buf)
        this.netgateId = t;
        step++;
        n -= len;
        break;
      case 4:
        temp_buf = [];
        temp_buf.push(Buffer.from([hexData[i]]));
        var t = Buffer.concat(temp_buf)
        if(t == this.flag_start){
          n--;
          step++;
        }else{
          return false;
        }
        break;
      case 5:
        var crcsum = [];
        var count = 0;
        for (let index = i; index < this.bypelength+i; index++) {
          crcsum.push(Buffer.from([hexData[index]]));
          if (index==0) {
            this.module_count = Buffer.concat(crcsum).readInt8();
            count = this.module_count;
            continue;
          }
          if(count--){
            break;
          }
          
        }
        this.totalcrc = CRC.CRC8(Buffer.concat(crcsum));
        break;
      default:
        console.log(hexData[i]);
        n--;
        break;
    }
  }
  stop = 0;
}
/**
 * 
 */
TcpBuffer.prototype.setBuild = function(obj){
  var moduleCount = obj.modules.length;
  var tempbuf = null;
  var tempobj = {};
  var buf_arr = []
  var front_model_arr = [
    ['stat', 'string', 4], // (STAT)
    ['totalLength', 'uint', 2], // (长度)
    ['cmd', 'uint', 1], // （cmd）
    ['netgateId', 'buffer', 6], // （网关ID）
    ['startFlag', 'buffer', 1], 
    ['moduleCount', 'uint', 1] // 模块个数)
  ];
  tempbuf = parseProto(front_model_arr);
  tempobj = {
    stat: this.flag_STAT,
    totalLength: new Buffer([00, 0x0f]),
    cmd: obj.cmd,
    netgateId: obj.netgateId,
    start_flag: this.flag_start,
    moduleCount: moduleCount,
  }
  for(let i = 0; i < moduleCount; i++){
    model_arr.push(
      // 每个模块了
      ['front_'+i, 'buffer', 1],// （头）
      ['subLength_'+i, 'uint', 1],// （长度）
      ['dFront_'+i, 'buffer', 1],
      ['dType_'+i, 'buffer', 2], //（设备类型） 
      ['devId_'+i, 'buffer', 6], // （设备ID）
      ['data_'+i, 'uint', 1], //  (具体的数据)
      ['subCrc_'+i, 'uint', 1], //0E （crc）
      ['endFlag_'+i, 'buffer', 1] //CC    （模块数据）
    )
  }
  model_arr.push(
    ['totalCrc', 'uint', 1], //33  CRC(总)
    ['end', 'string', 3] //45 4E 44 （END）
  )
  this.Modelbuf = parseProto(model_arr);
  // var b = Modelbuf.encodeEx({a: 1, b: 2, c: 3.3, d: 4.4, e: 'a', f: new Buffer('b')});
  this.tempObj = {
    stat: this.flag_STAT,
    totalLength: new Buffer([00, 0x0f]),
    cmd: obj.cmd,
    netgateId: obj.netgateId,
    start_flag: this.flag_start,
    moduleCount: moduleCount,
    front_0: this.flag_front,
    subLength_0: new Buffer([09]),
    dFront_0: this.flag_d_start,
    dType_0: obj.modules[0].dType,
    devId_0: obj.modules[0].devId,
    data_0: obj.modules[0].data,
    subCrc_0: CRC.CRC8(subCrc),
    endFlag_0: this.flag_reer,
    totalCrc: CRC.CRC8(totalCrc),
    end: this.flag_END,
  }
  console.log(model_arr);
  return moduleCount;
}

TcpBuffer.prototype._front_buf_model = function(obj){
  var moduleCount = obj.modules.length;
  //  i need the length from bb to total CRC
  // sub module's buf length
  this.sub_buf_length
}
TcpBuffer.prototype._module_buf_model = function(modules){
  var moduleCount = modules.length;
  var sub_buf_arr = [];
  for(let i = 0; i < moduleCount; i++){
    sub_buf_arr.push(
      // 每个模块了
      ['front_'+i, 'buffer', 1],// （头）
      ['subLength_'+i, 'uint', 1],// （长度）
      ['dFront_'+i, 'buffer', 1],
      ['dType_'+i, 'buffer', 2], //（设备类型） 
      ['devId_'+i, 'buffer', 6], // （设备ID）
      ['data_'+i, 'uint', 1], //  (具体的数据)
      ['subCrc_'+i, 'uint', 1], //0E （crc）
      ['endFlag_'+i, 'buffer', 1] //CC    （模块数据）
    )
  }
  var buf = parseProto(sub_buf_arr);
  modules.forEach(function(item, index){

  })
  var tempobj = {
    front_0: this.flag_front,
    subLength_0: new Buffer([09]),
    dFront_0: this.flag_d_start,
    dType_0: obj.modules[0].dType,
    devId_0: obj.modules[0].devId,
    data_0: obj.modules[0].data,
    subCrc_0: CRC.CRC8(subCrc),
    endFlag_0: this.flag_reer,
  }
  this.total_buf_length = buf.size;
}
TcpBuffer.prototype._data_buf_model = function(module){

}
TcpBuffer.prototype._reer_buf_model = function(obj){

}
// var DataProcess = function(hexData){
//   var module_count = hexData.readUInt8(14);
//   var model_arr = [];
//   model_arr.push(
//     ['stat', 'string', 4], // (STAT)
//     ['total_length', 'uint', 2], // (长度)
//     ['cmd', 'uint', 1], // （cmd）
//     ['netgateid', 'buffer', 6], // （网关ID）
//     ['start_flag', 'buffer', 1], 
//     ['module_count', 'uint', 1] // 模块个数)
//   );
//   for(let i = 0; i < module_count; i++){
//     model_arr.push(
//       // 每个模块了
//       ['front'+i, 'buffer', 1],// （头）
//       ['sub_length'+i, 'uint', 1],// （长度）
//       ['d_front'+i, 'buffer', 1],
//       ['d_type'+i, 'buffer', 2], //（设备类型） 
//       ['dev_id'+i, 'buffer', 6], // （设备ID）
//       ['data'+i, 'uint', 1], //  (具体的数据)
//       ['sub_crc'+i, 'uint', 1], //0E （crc）
//       ['end_flag'+i, 'buffer', 1] //CC    （模块数据）
//     )
//   }
//   model_arr.push(
//     ['total_crc', 'uint', 1], //33  CRC(总)
//     ['end', 'string', 3] //45 4E 44 （END）
//   )
//   var Modelbuf = parseProto(model_arr);
//   var cobj = Modelbuf.decode(hexData);
//   for (var prop in cobj) {
//     console.log("cobj." + prop + " = " + cobj[prop])
//   }
//   console.log(cobj);
// }

// var dataArray = [];
// var Modelbuf = parseProto([
//   ['stat', 'string', 4], // (STAT)
//   ['total_length', 'uint', 2], // (长度)
//   ['cmd', 'uint', 1], // （cmd）
//   ['netgateid', 'uint', 6], // （网关ID）
//   ['start_flag', 'uint', 1], 
//   ['module_count', 'uint', 1], // 模块个数
//   // 每个模块了
//   ['front', 'uint', 1],// （头）
//   ['sub_length', 'uint', 1],// （长度）
//   ['d_front', 'uint', 1],
//   ['d_type', 'uint', 2], //（设备类型） 
//   ['dev_id', 'uint', 6], // （设备ID）
//   ['data', 'uint', 1], //  (具体的数据)
//   ['sub_crc', 'uint', 1], //0E （crc）
//   ['end_flag', 'uint', 1], //CC    （模块数据）
//   //结束
//   ['total_crc', 'uint', 1], //33  CRC(总)
//   ['end', 'string', 3] //45 4E 44 （END）
// ])
// var buf = Modelbuf.encode('STAT', 15, 1, 0, 187, 1, 170, 9, 187, 256, 1099511627776, 1, 14, 204, 51, 'END');
// dataArray.push(buf);
// dataArray.push(buf);

// console.log(Buffer.concat(dataArray));
module.exports = TcpBuffer;
