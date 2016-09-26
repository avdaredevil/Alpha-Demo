var express = require('express');
var fs = require('fs');
var WriteAP = require('./tools/WriteAP');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var app = express();
var session = require('express-session');
var hash = require('pwd').hash;
//==DB==================================================================================|
WriteAP("*Connecting to DB [ASYNC]");
mongoose.connect("mongodb://localhost/Alpha");
//==Models==============================================================================|
WriteAP("*Loading Models:");
var models_dir = __dirname + '/models';
fs.readdirSync(models_dir).forEach(function (file) {
    if(file[0] === '.') return; 
    WriteAP(">+Loading ["+file.split(".")[0]+"]");
    require(models_dir+'/'+ file);
});
var User = mongoose.model('User');
//==View=Engine=========================================================================|
WriteAP("*Setting up Views Engine:");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//==Middleware==========================================================================|
WriteAP("*Assigning Middleware:");
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({genid: function(req) {return require('crypto').randomBytes(48).toString('hex')},secret: 'TrainD AP-Gilbert',resave:false,saveUninitialized:false}))
app.use(passport.initialize());
app.use(passport.session());
app.use(require("connect-flash")());
app.use("/assets",express.static(path.join(__dirname, 'public')));
app.use("/module",express.static(path.join(__dirname, 'bower_components')));
//==Routing=============================================================================|
WriteAP("*Setting up Routes:");
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/app'));
//==AUTH================================================================================|
WriteAP("*Setting up Auth [Passport]:");
var passCallback = (token, tokenSecret, profile, done) => User.findOrCreateOAuthUser(profile,done)
passport.use(new LocalStrategy({usernameField: 'email',passwordField: 'password'},User.isValidUserPassword));
passport.serializeUser(function(user, done) {done(null, user.id)})
passport.deserializeUser(function(id, done) {User.findById(id, function (err, user){done(err, user)})})
//==ERROR=HANDLERS======================================================================|
WriteAP("*Setting up Server-ErrorHandlers:");
WriteAP(">+Error Code ["+"404".green+"]");
app.use(function(req, res, next){
    res.status(404);
    if (req.accepts('html')) {
        res.render('errors/404', {url: req.url});
        return;
    } else if (req.accepts('json')) {
        res.send({error: 'Not found'});
        return;
    }
    res.type('txt').send('Not found');
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  WriteAP(">+Error Code ["+"500".green+":"+"DevMode".yellow+"]");
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
WriteAP(">+Error Code ["+"500".green+"]");
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

WriteAP("+Completed! Exporting...");
module.exports = app;
