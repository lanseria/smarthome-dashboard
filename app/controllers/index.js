var Promise = require('bluebird');
var User = require('../models/user');
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
  res.render('devices', {

  });
}

exports.devicetype = function(req, res){
  res.render('devicetype', {
    
  })
}


