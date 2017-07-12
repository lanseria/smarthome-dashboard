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

exports.register = function(req, res){
  res.render('register', {

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
          console.log("login suc");
          return res.redirect('/index');
        })
      }else{
        return res.redirect('/index');
      }
    })
  })
}
exports.signup = function(req, res){
  var _user = req.body.user;
  User.findOne({name:_user.name}, function(err, user){
    //return res.redirect('/signupSuccess');
    console.log(user);
    if(err){
      console.log(err);
    }
    if(user){
      console.log(user);
      return res.redirect('/login');
    }else{
      user = new User(_user);
      console.log(user);
      user.save(function(err, user){
        if(err){
          console.log(err);
        }
        req.session.user = user;
        return res.redirect('/index');
      })
    }
  })
}

// logout
exports.logout = function(req, res){
  delete req.session.user;
  //delete app.locals.user;
  res.redirect('/index');
}