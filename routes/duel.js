var express = require('express');
var router = express.Router();
let Duel = require('../models/Duel');
let User = require('../models/User');
let ObjectID = require('mongodb').ObjectID;

router.post('/startDuel', function(req, res, next) {
  var user = new User();
  user.number = req.body.number;
  user.save(function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(user);
    }
  });
})

router.get('/getDuelsByUsersAndState', function(req, res, next) {
  var userIDOne = req.query.userIDOne;
  var userIDTwo = req.query.userIDTwo;

  Duel.find({$and: [{users: { $all: [userIDOne, userIDTwo]} }, {state: { $in: [ 'shot', 'drawn', 'accepted', 'pending' ] }}]}, function(err, duels) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(duels);
    }
  });

});

router.post('/createRandomDuels', function(req, res, next) {
  for (i = 0; i < 50; i++) {
    duel = new Duel();
    duel.users = ['5ccca2ed82834100177f1cdc', '5ccca2ed82834100177f1cdc'];
    duel.state = 'completed';
    var random_boolean = Math.random() >= 0.3;
    if (random_boolean) {
      duel.winner = '5ccca2ed82834100177f1cdc';
    } else {
      duel.winner = '5cccb28ab64ed90017103245'
    }
    duel.save(function(err, duel) {
      if (err) {
        console.log(err);
      }
    })
  }
  res.status(200).send("success");
});

module.exports = router;
