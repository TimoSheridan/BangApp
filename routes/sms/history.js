var express = require('express');
var router = express.Router();
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();

  User.findOne({ number: req.body.From }, handleUserLookup);

  function handleUserLookup(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! User not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      Duel.find({ $and: [ {users: user._id }, { state: 'completed' }]})
        .populate('winner')
        .exec(handleDuelLookup);
    }
  }

  function handleDuelLookup(err, duels) {
    if (err || !duels) {
      twiml.message("An unexpected error occurred! No duels found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      var wins = 0;
      var losses = 0;
      var winPercentage;
      var message;
      for (let duel of duels) {
        if (duel.winner.number === req.body.From) {
          wins++;
        } else {
          losses++;
        }
      }
      winPercentage = Math.round((wins / (wins + losses)) * 100);
      if (isNaN(winPercentage)) {
        message = "Record: " + wins + "-" + losses + "\nPercentage: --%";
      } else {
        message = "Record: " + wins + "-" + losses + "\nPercentage: " + winPercentage + "%";
      }
      twiml.message(message);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }
});

module.exports = router;
