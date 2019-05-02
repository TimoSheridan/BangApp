let mongoose = require('mongoose');
let ObjectID = require('mongodb').ObjectID;
const Schema = mongoose.Schema;


let DuelSchema = new mongoose.Schema({
  users: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
  startTime: Date,
  drawTime: Date,
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  state: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'drawn', 'shot', 'completed'],
    default: 'pending'
  }
});

let Duel = mongoose.model('Duel', DuelSchema);

module.exports = Duel;
