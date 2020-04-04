const express = require('express');
const morgan = require('morgan');
const compress = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const activeModules = require('./modules.js').activeModules;
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const AUTH_SECRET = process.env.AUTH_SECRET;

module.exports = function(){
	const app = express();
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
			jwt.verify(token, AUTH_SECRET, function(err, decoded) {
				if (err) { 
					app.locals.auth_user = null;
					next();
				} else {
					app.locals.auth_user = res.locals.auth_user = {};
					app.locals.auth_user.username = res.locals.auth_user.username = decoded.username;
					app.locals.auth_user._id = res.locals.auth_user._id = decoded.user_id;
					app.locals.auth_user.role = res.locals.auth_user.role = decoded.role;
					app.locals.auth_user.contact = res.locals.auth_user.contact = decoded.contact;
					next();
				}
			});
		} else {
			app.locals.auth_user = null;
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