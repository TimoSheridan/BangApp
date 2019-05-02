var express = require('express');
var router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
let User = require('../models/User');
let Duel = require('../models/Duel');
var twilio = require('twilio');
var client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const phone  = require('phone');
let ObjectID = require('mongodb').ObjectID;
const messages = require('../public/messages/messages.js');

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();
  body = req.body.Body.trim();
  challenger = null;
  sentTo = null;
  var bangingUser;

  if (body) {
    indexOfSpace = body.indexOf(' ');
    if (indexOfSpace === -1) {
      command = body;
    } else {
      command = body.slice(0, body.indexOf(' '));
    }

    if (command === "COMMANDS") {
      twiml.message("Commands:\n\'DUEL [phone number]\' to start a duel.\n\'BANG\' to fire once you're in a duel.\n\'COMMAND\' to see commands.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (command === 'DUEL') {
      User.findOne({ number: req.body.From }, handleChallengerLookup)
    } else if (command === 'ACCEPT') {
      console.log("accept");
      User.findOne({ number: req.body.From }, handleAcceptUserLookup);
    } else if (command === 'BANG') {
      User.findOne({ number: req.body.From }, handleBangUserLookup);
    } else {
      twiml.message("We didn't recognize that command! Type \'COMMANDS\' for a list of commands");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }

  } else {
    twiml.message("We didn't recognize that command! Type \'COMMANDS\' for a list of commands");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }

  function handleBangUserLookup(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! User not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      bangingUser = user;
      Duel.findOne({ $or: [ { state: 'drawn' }, { state: 'shot' }], users: user._id }, handleBangDuelLookup);
    }
  }

  function handleBangDuelLookup(err, duel) {
    if (err || !duel) {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      if (duel.state === 'drawn') {
        duel.winner = bangingUser._id;
        duel.state = 'shot';
        duel.save(handleBangDrawnDuelSave);
      } else if (duel.state === 'shot') {
        duel.state = 'completed';
        duel.save(handleBangShotDuelSave);
      }
    }
  }

  function handleBangDrawnDuelSave(err, duel) {
    if (err) {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      twiml.message(messages.success[Math.floor(Math.random() * messages.success.length)]);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

  function handleBangShotDuelSave(err, duel) {
    if (err) {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      twiml.message(messages.failure[Math.floor(Math.random() * messages.failure.length)]);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

  function handleAcceptUserLookup(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      console.log("in handle accept user lookup");
      console.log(user._id);
      Duel.findOne({ state: 'pending', users: user._id }, handleDuelLookup)
    }
  }

  function handleDuelLookup(err, duel) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (duel) {
      console.log("udel");
      duel.state = 'accepted';
      duel.startTime = Date.now();
      duel.drawTime = Date.now();
      duel.drawTime.setMinutes(duel.drawTime.getMinutes() + (Math.floor(Math.random() * 55) + 5));
      duel.drawTime.setSeconds(duel.drawTime.getSeconds() + (Math.floor(Math.random() * 60) + 1));
      duel.save(handleDuelStartSave);
    } else {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

  function handleDuelStartSave(err, newDuel) {
    console.log("handling duel start save");
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      var counter = 0;
      for (let user of newDuel.users) {
        console.log("in for loop");
        User.findById(user, function(err, user) {
          if (err) {
            console.log(err);
          } else {
            client.messages.create({
              body: "The DUEL is on! At some point in the next hour, you will receive a message telling you to DRAW. The first to repond with BANG will be the winner!",
              to: user.number,  // Text this number
              from: '+18304444565' // From a valid Twilio number
            })
            .then(function(message) {
              console.log("message sent to " + message.to)
            });
          }
          counter++;
          if (counter >= 2) {
            twiml.message("Success");
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          }
        });
      }
    }
  }

  function findDefendant() {
    if (body.indexOf(' ') === -1) {
      console.log("no phone");
      twiml.message("Please include a phone number to duel!");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      number = body.slice(body.indexOf(' ') + 1, body.length);
      number = phone(number)[0];
      console.log(number);
      User.findOne({ number: number }, handleUserLookup);
    }
  }

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

  function handleUserLookup(err, user) {
    if (err) {
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (user) {
      console.log(user.number);
      client.messages.create({
        body: 'You\'ve been challenged to a duel by ' + req.body.From + '! Type ACCEPT to accept the duel',
        to: user.number,  // Text this number
        from: '+18304444565' // From a valid Twilio number
      })
      .then(function(message) {
        sentTo = message.to;
        duel = new Duel();
        duel.users = [user._id, challenger];
        duel.save(handleDuelSave);
      });
    } else {
      console.log("else - no user found");
      user = new User();
      user.number = number;
      user.save(handleUserSave);
    }
  }

  function handleUserSave(err, user) {
    if (err || !user) {
      console.log(err);
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      console.log(user.number);
      console.log("else  - user saved")
      client.messages.create({
        body: 'You\'ve been challenged to a duel by ' + req.body.From + '! Type ACCEPT to accept the duel',
        to: user.number,  // Text this number
        from: '+18304444565' // From a valid Twilio number
      })
      .then(function(message) {
        sentTo = message.to;
        duel = new Duel();
        duel.users = [user._id, challenger];
        duel.save(handleDuelSave);
      });
    }
  }

  function handleDuelSave(err, duel) {
    console.log("handling duel save");
    if (err || !duel) {
      console.log("error in duel save");
      twiml.message("An unexpected error occurred! Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      twiml.message("Duel invitation sent to " + sentTo);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  }

})

function startDuel() {
  return;
}

module.exports = router;
