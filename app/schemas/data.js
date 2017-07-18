var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var DataSchema = new Schema({
  value: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 0
  },
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
DataSchema.pre('save', function (next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now();
	}
	next()
})
DataSchema.statics = {
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
module.exports = DataSchema;