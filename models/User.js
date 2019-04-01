let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  name: String
});

let User = mongoose.model('User', UserSchema);

module.exports = User;
