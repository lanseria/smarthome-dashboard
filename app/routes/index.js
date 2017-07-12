'use strict'
var Index = require('../controllers/index');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

module.exports = function(app){
  app.use(function(req, res, next){
    app.locals.url = req.url;
    var _user = req.session.user;
    app.locals.user = _user;
    console.log(_user);
    next();
  })
  // index page
  app.get('/', Index.index)

  app.get('/index', Index.index)

  app.get('/sensors', Index.sensors)

  app.get('/controllers', Index.controllers)

  app.get('/devices', Index.devices)

  app.get('/login', Index.login)

  app.post('/signin', Index.signin)

  app.get('/register', Index.register)

  app.post('/signup', Index.signup)

  app.get('/logout', Index.logout)
}