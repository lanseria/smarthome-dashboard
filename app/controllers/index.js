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

exports.login = function(req, res){
  res.render('login', {

  });
}

exports.signin = function(req, res){
  var _user = req.body.user;
  var name = _user.name;
  var password = _user.password;
  User.findOne({name: name}, function(err, user){
    if (err) {
      console.log(err);
    }
    if (!user) {
      return res.redirect('/index');
    }
    user.comparePassword(password, function(err, isMatch){
      if (err) {
        console.log(err);
      }
      if (isMatch) {
        req.session.user = user;
        User.update({_id: user._id}, {$inc: {loginCount: 1}}, function(err){
          if (err) {console.log(err);}
          return res.redirect('/loginSuccess');
        })
      }else{
        return res.redirect('/index');
      }
    })
  })
}
