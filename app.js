var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// const MongoClient = require(‘mongodb’).MongoClient;
// const uri = "mongodb://" + process.env.CLOUD_ATLAS_USER + ":" + process.env.CLOUD_ATLAS_PW + "@bangapp-shard-00-00-yh6bx.mongodb.net:27017,bangapp-shard-00-01-yh6bx.mongodb.net:27017,bangapp-shard-00-02-yh6bx.mongodb.net:27017/test?ssl=true&replicaSet=BangApp-shard-0&authSource=admin&retryWrites=true"

// const uri = "mongodb+srv://" + process.env.CLOUD_ATLAS_USER + ":" + process.env.CLOUD_ATLAS_PW + "@bangapp-yh6bx.mongodb.net/test?retryWrites=true?authSource=admin";


var MongoClient = require('mongodb').MongoClient;

var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

var uri = "mongodb://bangUser:bang@cluster0-shard-00-00-yh6bx.mongodb.net:27017,cluster0-shard-00-01-yh6bx.mongodb.net:27017,cluster0-shard-00-02-yh6bx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";
MongoClient.connect(uri, options, function(err, client) {
  console.log(err);
  console.log(client);
  const db  = client.db("Hello");
  db.createCollection("Hi there", {});
  // const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  // client.close();
});




// const uri = "mongodb://" + process.env.CLOUD_ATLAS_USER + ":" + process.env.CLOUD_ATLAS_PW + "@bangapp-shard-00-00-yh6bx.mongodb.net:27017,bangapp-shard-00-01-yh6bx.mongodb.net:27017,bangapp-shard-00-02-yh6bx.mongodb.net:27017/test?ssl=true&replicaSet=BangApp-shard-0&authSource=admin&retryWrites=true"

//const uri = "mongodb+srv://" + process.env.CLOUD_ATLAS_USER + ":" + process.env.CLOUD_ATLAS_PW + "@bangapp-yh6bx.mongodb.net/test?retryWrites=true";
// const database_name = "BangApp";
// const client = new MongoClient(uri, { useNewUrlParser: true });



var app = express();

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

/* MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
    if(error) {
      console.log(error);
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection("people");
    console.log("Connected to `" + DATABASE_NAME + "`!");
}); */

// mongoose.connect(uri, {dbName: 'BangApp'});


/* db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function (callback) {
  console.log("db up");
}); */


module.exports = app;
