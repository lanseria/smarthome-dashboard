'use strict'
var Index = require('../controllers/index');
var User = require('../controllers/user');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = function(app){
  app.use(function(req, res, next){
    app.locals.url = req.url.substr(1,req.url.length);
    var _user = req.session.user;
    app.locals.user = _user;
    // console.log('url='+app.locals.url);
    next();
  })
  // index page
  app.get('/', User.signinRequired, Index.index)

  app.get('/index', User.signinRequired, Index.index)

  app.get('/sensors', User.signinRequired, Index.sensors)

  app.get('/controllers', User.signinRequired, Index.controllers)

  app.get('/devices', User.signinRequired, Index.devices)
  app.post('/devices', User.signinRequired, Index.adddevices)

  app.get('/devicetype', User.signinRequired, Index.devicetype)
  app.post('/devicetype', User.signinRequired, Index.adddevicetype)

  app.get('/login', User.login)

  app.post('/signin', User.signin)

  app.get('/register', User.register)

  app.post('/signup', User.signup)

  app.get('/logout', User.logout)
}