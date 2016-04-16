var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var UserSchema = new Schema({
  username: {type: String, required: true, unique: true},
  authentication: {
    email: {type: String, unique: true},
    password: String
  }
});

//hashes the password
UserSchema.methods.hashPassword = function(password) {
  var hash = this.authentication.password = bcrypt.hashSync(password, 8);
  return hash;
};

//compares the password once it is hashed
UserSchema.methods.compareHash = function(password) {
  return bcrypt.compareSync(password, this.authentication.password);
};

module.exports = mongoose.model('User', UserSchema);
