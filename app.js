
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var partials = require('express-partials');
var flash = require('connect-flash');
var app = express();
var ejs = require('ejs');
var util = require('util');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings.js');
var events = require('events');
// all environments
app.set('port', process.env.PORT || 3000);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.locals({
	user:'',
	error:'',
	success: ''
});

function refreshFn(req, res){
	  var error = req.flash('error');
	  var success = req.flash('success');
	  res.locals.user = req.session.user?req.session.user:null;
	  res.locals.post = req.session.post;
	  res.locals.error = error.length>0?error:null;
	  res.locals.success = success.length>0?success:null;		
}
// 基础配置
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.engine('.html', ejs.__express);
	app.set('view engine', 'html');
	app.use(flash());
	app.use(partials())
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: settings.cookieSecret,
		store: new MongoStore({
			db: settings.db
		})
	}));
	app.use(function(req, res, next){
		refreshFn(req, res);
	  	next();
	});			
	app.use(app.router);

	app.use(express.static(__dirname + '/public'));
});
routes(app);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
