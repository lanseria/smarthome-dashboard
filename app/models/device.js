var mongoose = require('mongoose');
var deviceSchema = require('../schemas/device');
var device = mongoose.model('device', deviceSchema);

module.exports = device