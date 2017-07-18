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
  res.render('sensors', {

  });
}

exports.controllers = function(req, res){
  res.render('controllers', {

  });
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



