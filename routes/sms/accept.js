var express = require('express');
var router = express.Router();
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var twilio = require('twilio');
var client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();

  User.findOne({ number: req.body.From }, handleUserLookup);

  function handleUserLookup(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      Duel.findOne({ state: 'pending', users: user._id }, handleDuelLookup)
    }
  }

  function handleDuelLookup(err, duel) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (duel) {
      duel.state = 'accepted';
      duel.startTime = Date.now();
      duel.drawTime = Date.now();
      duel.drawTime.setMinutes(duel.drawTime.getMinutes() + (Math.floor(Math.random() * 55) + 5));
      duel.drawTime.setSeconds(duel.drawTime.getSeconds() + (Math.floor(Math.random() * 60) + 1));
      duel.save(handleDuelUpdate);
    } else {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

  function handleDuelUpdate(err, newDuel) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      var counter = 0;
      for (let user of newDuel.users) {
        // console.log("in for loop");
        User.findById(user, function(err, user) {
          if (err) {
            // console.log(err);
          } else {
            client.messages.create({
              body: "The DUEL is on! At some point in the next hour, you will receive a message telling you to DRAW. The first to repond with BANG will be the winner!",
              to: user.number,  // Text this number
              from: '+18304444565' // From a valid Twilio number
            })
            .then(function(message) {
              // console.log("message sent to " + message.to)
            });
          }
          counter++;
          if (counter >= 2) {
            twiml.message("Invitation accepted!");
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          }
        });
      }
    }
  }

});

module.exports = router;
