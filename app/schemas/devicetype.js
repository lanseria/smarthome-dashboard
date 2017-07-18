var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var DevicetypeSchema = new Schema({
	name: String,
	users:[{
		type: ObjectId,
		ref:'user'
	}],
	isController: {
		type: Number,
		default: 0
	},
  devices: [{
    type: ObjectId,
    ref: 'device'
  }],
	devkey:String,
	icon:String,
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
DevicetypeSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now();
	}
	next()
})
DevicetypeSchema.statics = {
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
module.exports = DevicetypeSchema;