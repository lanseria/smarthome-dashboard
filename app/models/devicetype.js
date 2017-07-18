var mongoose = require('mongoose');
var devicetypeSchema = require('../schemas/devicetype');
var devicetype = mongoose.model('devicetype', devicetypeSchema);

module.exports = devicetype