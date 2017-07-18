var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var DeviceSchema = new Schema({
	devicetype: {
    type: ObjectId,
    ref: 'devicetype'
  },
	user: {
    type: ObjectId,
    ref: 'user'
  },
	data:[{
    type: ObjectId,
    ref: 'data'
  }],
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
});
DeviceSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now();
	}
	next()
})
DeviceSchema.statics = {
	fetch:function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb);
	},
	findById:function(id, cb){
		return this
			.findOne({
				_id:id
			})
			.exec(cb);
	}
}
module.exports = DeviceSchema;