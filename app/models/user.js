var mongoose = require('mongoose');
var userSchema = require('../schemas/user');
var user = mongoose.model('user', userSchema);

module.exports = user