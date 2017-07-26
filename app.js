var net = require('net');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);

//-----------------------
var Data = require('./app/models/data');
var Device = require('./app/models/device');

//-----------------------
var option = {
  host: "192.168.191.5",
  port: 7894
}
var network = require('./network/app.js').network;

var netserver = new network(option);

netserver.start(function(err, server_data){
  // console.info(server_data.toString());
  /**
   * server_data里有硬件控制台的ID
   * 采集的数据datas
   * 时间time
   */
  var obj = JSON.parse(server_data.toString());
  var cid = obj.cid;
  var datas = obj.data;
  var time = obj.time;
  //分析完成之后
  var Data = require('./app/models/data');
  var _ = require('lodash');
  _.forIn(datas, function(val, key){
    // console.log(val,key);
    var count = val.length;
    val.forEach(function(item, index){
      var _data = item;
      var data = new Data(_data);
      data.save(function(err, data){
        if(err){console.log(err)}
        Device
        .findOne({devid: _data.devid})
        .exec(function(err, device){
          // device.data = [];
          device.data.push(data._id);
          device.save(function(err, device){
            if(err){console.log(err)}
            if(count<=0){
              console.log('over');
            }else{
              count--;
            }
          })
        })
      })
    })
  })
});

//---------------------------

var config = require('./config.js');

var dbUrl = 'mongodb://localhost/smarthome';
var port = process.env.PORT || 3002;

var app = express();

mongoose.connect(dbUrl);

app.set('views', path.join(__dirname, './app/views/pages'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '/assets/img/favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret:'imooc',
  resave: false,
  saveUninitialized: true,
  store:new mongoStore({
    url:dbUrl,
    collection: 'sessions'
  })
}));
var env = process.env.NODE_ENV || 'development';

if('development' === env){
  app.set('showStackError', true);
  app.use(logger(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug', true);
}
app.locals.moment = require('moment');
app.locals.web = config.web;

require('./app/routes/index')(app);

app.listen(port);

console.log('smart-home started on port ' + port + ' http://localhost:' + port);
