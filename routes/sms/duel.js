var express = require('express');
var router = express.Router();
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const phone  = require('phone');
var twilio = require('twilio');
var client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();
  var challenger;
  var defendant;
  var sentTo;

  User.findOne({ number: req.body.From }, handleChallengerLookup);

  function handleChallengerLookup(err, user) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (user) {
      challenger = user._id;
      findDefendant();
    } else {
      user = new User();
      user.number = req.body.From;
      user.save(handleChallengerSave);
    }
  }

  function handleChallengerSave(err, user) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      challenger = user._id;
      findDefendant();
    }
  }

  function findDefendant() {
    if (body.indexOf(' ') === -1) {
      // console.log("no phone");
      twiml.message("Please include a phone number to duel!");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      number = body.slice(body.indexOf(' ') + 1, body.length);
      number = phone(number)[0];

      if (number === req.body.From) {
        twiml.message("You cannot duel yourself!");
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
      } else {
        User.findOne({ number: number }, handleDefendantLookup);
      }
    }
  }

  function handleDefendantLookup(err, user) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (user) {
      defendant = user;
      Duel.find({ $and: [ { users: { $all: [user._id, challenger]} }, { state: {$in: [ 'drawn', 'shot', 'pending', 'accepted']} } ]}, handleActiveDuelCheck );
    } else {
      // console.log("else - no user found");
      user = new User();
      user.number = number;
      user.save(handleDefendantSave);
    }
  }

  function handleDefendantSave(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      defendant = user;
      Duel.find({ $and: [ { users: { $all: [user._id, challenger]} }, { state: {$in: [ 'drawn', 'shot', 'pending', 'accepted']} } ]}, handleActiveDuelCheck );
    }
  }

  function handleActiveDuelCheck(err, duels) {
    if (err) {
      // console.log(err);
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (duels !== undefined && duels.length > 0) {
      // console.log(duels);
      twiml.message("There is already a pending or active duel between you two!");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      client.messages.create({
        body: 'You\'ve been challenged to a duel by ' + req.body.From + '! Type ACCEPT to accept the duel',
        to: defendant.number,  // Text this number
        from: '+18304444565' // From a valid Twilio number
      })
      .then(function(message) {
        sentTo = message.to;
        duel = new Duel();
        duel.users = [defendant._id, challenger];
        duel.save(handleNewDuelSave);
      });
    }
  }

  function handleNewDuelSave(err, duel) {
    // console.log("handling duel save");
    if (err || !duel) {
      // console.log("error in duel save");
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      twiml.message("Duel invitation sent to " + sentTo);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

});

module.exports = router;
