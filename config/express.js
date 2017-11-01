var config = require('./env/'+ process.env.NODE_ENV +'.js');
var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var activeModules = require('./modules.js').activeModules;
var helmet = require('helmet');
var jwt = require('jsonwebtoken');

module.exports = function(){
	var app = express();
	if(process.env.NODE_ENV === 'development'){
		app.use(morgan('dev'));
	}else if(process.env.NODE_ENV === 'production'){
		app.use(compress());
	}

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(cookieParser());

	// security-related HTTP headers:
	app.use(helmet());

	//Auth user details from JWT 
	app.use(function (req, res, next) {
		let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.cookies && req.cookies.access_token) || req.headers['x-access-token'];
		if (token) {
			jwt.verify(token, config.auth_secret, function(err, decoded) {
				if (err) { 
					app.locals.auth_user = null;
					console.log('test');
					next();
				} else {
					app.locals.auth_user = req.auth_user = {};
					app.locals.auth_user.username = req.auth_user.username = decoded.username;
					app.locals.auth_user._id = req.auth_user._id = decoded.user_id;
					app.locals.auth_user.role = req.auth_user.role = decoded.role;
					console.log('decoded');
					next();
				}
			});
		} else {
			app.locals.auth_user = null;
			console.log('not avail');
			next();
		}

	});

	// Setting view engine
	app.set('view engine', 'ejs');
	app.set('views', './app');

	// Saving module details to local 
	app.locals = require('./app-config.js').moduleLocals;

	// Loading routes.
	console.log("loading routes...");
	activeModules.forEach(function(module) {
		moduleRoutes = require('../app/' + module.name + '/config/' + module.name + '.locals.json').routes;
		if(moduleRoutes != undefined){
			moduleRoutes.forEach(function(routeFile){
				require('../app/'+ module.name + '/routes/' + routeFile)(app);
				console.log("loading " + routeFile);
			});
		}
	});

	app.use(express.static('./app'));
	return app;
}