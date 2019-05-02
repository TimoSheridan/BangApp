let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  number: {
    type: String,
    unique: true,
    required: true
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = User;
