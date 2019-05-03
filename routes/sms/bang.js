var express = require('express');
var router = express.Router();
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const messages = require('../../public/messages/messages.js');

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();
  var bangingUser;

  User.findOne({ number: req.body.From }, handleUserLookup);

  function handleUserLookup(err, user) {
    if (err || !user) {
      twiml.message("An unexpected error occurred! User not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      bangingUser = user;
      Duel.findOne({ $or: [ { state: 'drawn' }, { state: 'shot' }], users: user._id }, handleDuelLookup);
    }
  }

  function handleDuelLookup(err, duel) {
    if (err || !duel) {
      twiml.message("An unexpected error occurred! Duel not found. Please try again.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else {
      if (duel.state === 'drawn') {
        duel.winner = bangingUser._id;
        duel.state = 'shot';
        duel.save(handleDrawnDuelSave);
      } else if (duel.state === 'shot') {
        duel.state = 'completed';
        duel.save(handleShotDuelSave);
      }
    }
  }

  function handleDrawnDuelSave(err, duel) {
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

  function handleShotDuelSave(err, duel) {
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

});

module.exports = router;
