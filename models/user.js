var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
  // username and email will be unique
  username: { type: String, required: true, index: { unique: true }},
  email: { type: String, required: true, index: { unique: true }},
  // password will not be returned by queries unless explicitly asked
  password: { type: String, required: true, select: false }
});

// hashing the password before saving it
UserSchema.pre('save', function(next) {
  var user = this;
  // if password is unchanged, continue
  if(!user.isModified('password')) return next();

  var salt = "$2a$10$PUx1NCWC3m78bZcAsqiHXO";

  // if password is changed or user is new, hash the password
  bcrypt.hash(user.password, salt, function(err, hash) {
    if(err) return next(new Error(err));
    // make user password the hashed version
    user.password = hash;
    next();
  });
});

// method to compare password with the db hashed version
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
