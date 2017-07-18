var mongoose = require('mongoose');
var dataSchema = require('../schemas/data');
var data = mongoose.model('data', dataSchema);

module.exports = data