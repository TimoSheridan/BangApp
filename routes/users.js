var express = require('express');
var router = express.Router();
let User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/addUser', function(req, res, next) {
  console.log("hello");
  var user = new User();
  user.name = "Bob";
  user.save(function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(user);
    }
  });
})

module.exports = router;
