var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new Schema({
  username: {type: String, required: true},
  name: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Item', itemSchema);
