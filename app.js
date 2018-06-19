'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var loginModel = require('./models/login');
const dbConfig = require('./models/dbConfig');

const cookieParser = require('cookie-parser');

const session = require('express-session'); 
var MSSQLStore = require('connect-mssql')(session); 

const flash = require('express-flash');

const helmet = require('helmet'); //For Security considerations
const csrf = require('csurf'); //Cross-site Request Forgery (CSRF)

var bodyParser = require('body-parser'); 
var ejsBlocks = require('ejs-blocks');
var ejsLocals = require('ejs-locals');
var formValidator = require('express-validator'); //form validation middleware

var passport = require('passport'); //authentication module
var LocalStrategy = require('passport-local').Strategy; //authentication module
var ensureLogin = require('connect-ensure-login'); //authentication module

var routes = require('./routes/index');
var users = require('./routes/users');
var account = require('./routes/account');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsLocals); // Layout, blocks & partial concepts
app.set('view engine', 'ejs'); // Set View Engine, Example: pug, ejs, mustache etc... 

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(cookieParser());
app.use(session({
    name: 'mysession_cms_node_je_project',
    store: new MSSQLStore(dbConfig.config), 
    secret: 'kfdjglhksfdjhgksjfdlgskdfjgh',
    //key: 'super-secret-cookie',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        //secure: true,
        //httpOnly: true,
        // domain: 'http://localhost:3000',
        // path: 'http://localhost:3000',
        //expires: expiryDate
     }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(helmet());
app.use(csrf({ cookie: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(formValidator());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.isAuthenticated = req.isAuthenticated(); 
    res.locals.currentUserName = (req.user == undefined || req.user == null) ? '' : req.user.username;
    res.locals.currentUserId = (req.user == undefined || req.user == null) ? '' : req.user.userid;
    res.locals.currentRoleName = (req.user == undefined || req.user == null) ? '' : req.user.rolename;
    next();
});

app.use('/users', users);
app.use('/account', account);
app.use('/', routes);

passport.serializeUser(function(user, done) {    
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {    
    done(null, user);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('home/error', {
            message: err.message,
            error: err,
            metatitle: 'Error', 
            keyword: 'Error', 
            description: 'Error', 
            title: 'Error',
            pageUrl: req.path
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('home/error', {
        message: err.message,
        error: {},
        metatitle: 'Error', 
        keyword: 'Error', 
        description: 'Error', 
        title: 'Error',
        pageUrl: req.path
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
