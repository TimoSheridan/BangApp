var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv-extended').load();

let mongoose = require('mongoose');

const uri = "mongodb+srv://" + process.env.CLOUD_ATLAS_USER + ":" + process.env.CLOUD_ATLAS_PW + "@" + process.env.CLOUD_ATLAS_CLUSTER + "-yh6bx.mongodb.net/" + process.env.CLOUD_ATLAS_DB + "?retryWrites=true";
let db = mongoose.connection;

var duelRouter = require('./routes/duel');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var smsRouter = require('./routes/sms/sms');
var bangRouter = require('./routes/sms/bang');
var statusRouter = require('./routes/sms/status');
var app = express();

const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

let User = require('./models/User');
let Duel = require('./models/Duel');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sms', smsRouter);
app.use('/duels', duelRouter);
app.use('/sms/bang', bangRouter);
app.use('/sms/status', statusRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function (callback) {
  console.log("db up");
});

setInterval(function() {
  Duel.find({ state: 'accepted', drawTime: { $lte: Date.now() }})
  .populate('users')
  .exec(function(err, duels) {
    if (err) {
      console.log(err)
    } else {
      for (let duel of duels) {
        for (let user of duel.users) {
          client.messages.create({
            body: "DRAW! Respond BANG to shoot!",
            to: user.number,  // Text this number
            from: '+18304444565' // From a valid Twilio number
          })
        }
        duel.state = 'drawn';
        duel.save(function(err, newDuel) {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  })
}, 5 * 1000);

module.exports = app;
