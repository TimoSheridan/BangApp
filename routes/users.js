var express = require('express');
var router = express.Router();
let User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/addUser', function(req, res, next) {
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

module.exports = router;
