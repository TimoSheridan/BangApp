var express = require('express');
var router = express.Router();
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();

  console.log("in status");

  User.findOne({ number: req.body.From }, handleStatusLookup);

  function handleStatusLookup(err, user) {
    console.log("hanlde status lookup");
    if (err || !user) {
      if (err) {
        twiml.message("An unexpected error occurred! Please try again.");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
      } else {
        twiml.message("User not found! Start a duel with DUEL [phone number] to join our system.");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
      }
    } else {
      Duel.find({ $and: [ { users: user._id }, { state: {$in: [ 'drawn', 'shot', 'pending', 'accepted']} } ]})
        .populate('users')
        .exec(handleStatusDuelLookup);
    }
  }

  function handleStatusDuelLookup(err, duels) {
    if (err || !duels) {
      twiml.message("An error occurred: no pending/active duels found.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (duels.length === 0) {
      twiml.message("No pending/active duels found!");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      var message = "Duels: \n";
      var counter = 0;
      var state;
      for (let duel of duels) {
        state = duel.state;
        if (duel.state === 'shot') {
          state = 'drawn';
        }
        var messageAddendum =  "{ Users: " + duel.users[0].number + ", " + duel.users[1].number + "\nStatus: " + state + " }";
        if (counter != 0) {
          messageAddendum = "\n" + messageAddendum;
        }
        message = message + messageAddendum;
        counter++;
      }
      twiml.message(message);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

});

module.exports = router;
