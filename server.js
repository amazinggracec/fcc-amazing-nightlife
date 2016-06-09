var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var port = process.env.PORT || 8080;
var app = express();

require('dotenv').load();
require('./app/config/passport')(passport);

app.use('/public', express.static(process.cwd() + '/public'));

app.use('/css', express.static(process.cwd() + '/node_modules/bootstrap/dist/css')); 
app.use('/css', express.static(process.cwd() + '/node_modules/font-awesome/css')); 

app.use('/js', express.static(process.cwd() + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(process.cwd() + '/node_modules/angular'));
app.use('/js', express.static(process.cwd() + '/node_modules/masonry-layout'));
app.use('/js', express.static(process.cwd() + '/node_modules/jquery/dist'));

mongoose.connect(process.env.MONGO_URI);

/* persistent login session for passport */
app.use(require('express-session')({ 
    secret: 'keyboard cat', 
    resave: false, 
    saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

//to start server
app.listen(port || 8080, process.env.IP || "0.0.0.0", function(){
    console.log("server listening at", port);
});