var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var UserSchema = new Schema({
  name:{
    type: String,
    unique: true,
    trim: true,
  },
  password: String,
  // normal user 0
  // verified user 1
  // professional user 2
  // super admin >10 >50
  devices: [{
    type: ObjectId,
    ref: 'device'
  }],
  role: {
    type: Number,
    default: 0
  },
  loginCount: {
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
UserSchema.pre('save', function (next) {
  var user = this;
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now();
  }
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    })
  })
})

UserSchema.methods = {
  comparePassword:function(_password, cb){
    bcrypt.compare(_password, this.password, function(err, isMatch){
      if(err) return cb(err);
      cb(null, isMatch);
    })
  }
}

UserSchema.statics = {
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
module.exports = UserSchema;