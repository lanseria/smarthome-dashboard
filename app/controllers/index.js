var Promise = require('bluebird');
var User = require('../models/user');
var Devicetype = require('../models/devicetype');
var Device = require('../models/device');
var _ = require('lodash');

exports.index = function(req, res){
  res.render('index', {
    
  });
}

exports.sensors = function(req, res){
  var _user = req.session.user;
  Devicetype
  .find({isController: 0})
  .exec(function(err, devicetypes){
    var len = devicetypes.length;
    var sensors = [];
    devicetypes.forEach(function(dtype){
      Device
      .find({devicetype:dtype._id,user:_user._id})
      .populate('devicetype', 'name')
      .exec(function(err, devices){
        if (err) {
          console.log(err)
        }
        sensors.push(...devices)
        len--;
        if (len===0) {
          res.render('sensors', {
              sensors: sensors
          });
        }
      })
    })
  })
}

exports.restfull_sensors = function(req, res){
  var devid = req.query.devid;
  console.log(devid);
  if (devid===undefined) {
    return res.send("params error");
  }
  Device
  .findOne({devid: devid})
  .populate('data', 'meta value status')
  .exec(function(err, device){
    var dropcount = device.data.length - 20;
    var rdata = _.drop(device.data, dropcount);
    var data = {
      labels: _.map(_.map(rdata, 'meta.createAt'), second),
      series: [_.map(rdata, 'value')]
    }
    res.send(JSON.stringify(data))
  })
  function second(n){
    return n.getMinutes();
  }
}
exports.controllers = function(req, res){
 var _user = req.session.user;
  Devicetype
  .find({isController: 1})
  .exec(function(err, devicetypes){
    var len = devicetypes.length;
    var controllers = [];
    devicetypes.forEach(function(dtype){
      Device
      .find({devicetype:dtype._id,user:_user._id})
      .populate('devicetype', 'name')
      .exec(function(err, devices){
        if (err) {
          console.log(err)
        }
        controllers.push(...devices)
        len--;
        if (len===0) {
          res.render('controllers', {
            controllers:controllers
          });
        }
      })
    })
  })

}

exports.devices = function(req, res){
  Devicetype.fetch(function(err, types){
    Device
    .find({})
    .populate('devicetype', 'icon name')
    .exec(function(err, devices){
      res.render('devices', {
        types:types,
        devices:devices
      });
    })
  })
}
exports.adddevices = function(req, res){
  Devicetype.fetch(function(err, types){
    var _user = req.session.user;
    var _device = req.body.device;
    var device = new Device(_device);
    device.user = _user._id;
    console.log(device);
    device.save(function(err, device){
      if (err) {
        console.log(err);
      }
      return res.redirect('/devices');
    })
  })
}

exports.devicetype = function(req, res){
  Devicetype.fetch(function(err, types){
    res.render('devicetype', {
      types: types
    })
  })
}
exports.adddevicetype = function(req, res){
  var _devicetype = req.body.devicetype;
  // console.log(_devicetype);
  var devicetype = new Devicetype(_devicetype);
  console.log(devicetype);
  devicetype.save(function(err, devicetype){
    if(err) { console.log(err) }
    return res.redirect('/devicetype');
  })
}



