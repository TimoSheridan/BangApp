var express = require('express');
var router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
let User = require('../../models/User');
let Duel = require('../../models/Duel');
const messages = require('../../public/messages/messages.js');
var statusRouter = require('./status');
var bangRouter = require('./bang');
var duelRouter = require('./duel');
var historyRouter = require('./history');
var acceptRouter = require('./accept');

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();
  body = req.body.Body.trim();

  if (body) {
    indexOfSpace = body.indexOf(' ');
    if (indexOfSpace === -1) {
      command = body;
    } else {
      command = body.slice(0, body.indexOf(' '));
    }

    command = command.toUpperCase();

    if (command === "RULES") {
      twiml.message('Welcome to BANG! BANG is a two-player game: One player will challenge the other to a duel; once that player accepts, the duel begins. At a random time after the duel begins, both players will be instructed to draw their weapons and shoot. The first to respond with \'BANG\' is the winner!');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (command === "STATUS") {
      req.url = '/';
      statusRouter.handle(req, res, next);
      // User.findOne({ number: req.body.From }, handleStatusLookup)
    } else if (command === "COMMANDS") {
      twiml.message("Commands:\n\'ACCEPT\' to accept a duel challenge.\n\'BANG\' to fire once you're in a duel.\n\'COMMANDS\' to see commands.\n\'DUEL [phone number]\' to start a duel.\n\'HISTORY\' to see your performance in completed duels.\n\'RULES\' to see an overview of the game.\n\'STATUS\' to view your current pending and active duels.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    } else if (command === 'DUEL') {
      req.url = '/';
      duelRouter.handle(req, res, next);
      // User.findOne({ number: req.body.From }, handleChallengerLookup)
    } else if (command === 'ACCEPT') {
      req.url = '/';
      acceptRouter.handle(req, res, next);
      // User.findOne({ number: req.body.From }, handleAcceptUserLookup);
    } else if (command === 'BANG') {
      req.url = '/';
      bangRouter.handle(req, res, next);
      // User.findOne({ number: req.body.From }, handleBangUserLookup);
    } else if (command === 'HISTORY') {
      req.url = '/';
      historyRouter.handle(req, res, next);
      // User.findOne({ number: req.body.From }, handleHistoryUserLookup);
    } else {
      twiml.message("We didn't recognize that command! Type \'COMMANDS\' for a list of commands, or \'RULES\' for an overview of the game.");
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }

  } else {
    twiml.message("We didn't recognize that command! Type \'COMMANDS\' for a list of commands, or \'RULES\' for an overview of the game.");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }

});

module.exports = router;
