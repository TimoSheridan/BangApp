var express = require('express');
var router = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/', function(req, res, next) {
  const twiml = new MessagingResponse();

  var user = new User();
  user.number = req.body.Body;

  user.save(function (err, user) {
    if (err) {
      res.status(500).end(err);
    } else {
      twiml.message("user added: " + user.number);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  });
})

module.exports = router;
