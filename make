#!/bin/bash
moduleNameSingular="$2";
moduleNamePlural="$3";
moduleNameTitle="$4";

case "$1" in
	module)
	echo "Creating module $moduleNamePlural";
	mkdir app/$moduleNamePlural
	mkdir app/$moduleNamePlural/controllers
	mkdir app/$moduleNamePlural/config
	mkdir app/$moduleNamePlural/lib
	mkdir app/$moduleNamePlural/models
	mkdir app/$moduleNamePlural/public
	mkdir app/$moduleNamePlural/routes
	mkdir app/$moduleNamePlural/views

	# Config
	echo "{
	\"name\" : \""$moduleNamePlural"\",
	\"title\" : \""$moduleNameTitle"\",
	\"tagline\" : \"\",
	\"description\" : \"\",
	\"metaKeywords\" : \""$moduleNamePlural"\",
	\"metaDescription\" : \"\",
	\"icon\" : \"\",
	\"slider\" :\"\",
	\"url\": \"/"$moduleNamePlural"\",
	\"routes\": [\""$moduleNamePlural".server.api.route.js\",\""$moduleNamePlural".server.ui.route.js\"],
	\"models\": [\""$moduleNamePlural".server.model.js\"]
	}" > app/$moduleNamePlural/config/$moduleNamePlural.locals.json

	# Controller
	echo "var "$moduleNameSingular" = require('mongoose').model('"$moduleNameSingular"');
	var "$moduleNameSingular"Validation = require('../lib/"$moduleNamePlural".validation.js');
		exports.home = function(req, res){
		res.render('"$moduleNamePlural"/views/home');
	}

	exports."$moduleNameSingular"ById = function(req, res){
	res.render('"$moduleNamePlural"/views/home');
	}

	exports.list = function(req, res){
	res.render('"$moduleNamePlural"/views/list');
	}

	exports.add = function(req, res){
	res.render('"$moduleNamePlural"/views/add');
	}

	exports.create = function(req, res){
	res.send('Module Created !');
	}

	exports.edit = function(req, res){
	res.render('"$moduleNamePlural"/views/edit');
	}

	exports.update = function(req, res){
	res.render('Module Updated !');
	}

	exports.view = function(req, res){
	res.render('"$moduleNamePlural"/views/view');
	}

	exports.delete = function(req, res){
	res.render('"$moduleNamePlural"/views/delete');
	}

	exports.remove = function(req, res){
	res.send('Module Removed !');
	}" > app/$moduleNamePlural/controllers/$moduleNamePlural.server.controller.js

	#lib
	touch app/$moduleNamePlural/lib/$moduleNamePlural.validation.js

	#models
	echo "var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	var "$moduleNameSingular"Schema = new Schema({
		id : Schema.ObjectId
		});

	mongoose.model('"$moduleNameSingular"', "$moduleNameSingular"Schema);" > app/$moduleNamePlural/models/$moduleNamePlural.server.model.js

	#public
	mkdir app/$moduleNamePlural/public/css
	mkdir app/$moduleNamePlural/public/img
	mkdir app/$moduleNamePlural/public/js
	mkdir app/$moduleNamePlural/public/uploads
	touch app/$moduleNamePlural/public/css/$moduleNamePlural.css

	#UI routes
	echo "var "$moduleNamePlural"Controller = require('../controllers/"$moduleNamePlural".server.controller.js');
	var domainRoot = '';
	module.exports = function(app){
	app.route(domainRoot + '/"$moduleNamePlural"')
	.get("$moduleNamePlural"Controller.home) // home.ejs
	.post("$moduleNamePlural"Controller.create);
	
	app.route(domainRoot + '/"$moduleNamePlural"/list') 
	.get("$moduleNamePlural"Controller.list);

	app.route(domainRoot + '/"$moduleNamePlural"/add')
	.get("$moduleNamePlural"Controller.add); // add.ejs

	app.route(domainRoot + '/"$moduleNamePlural"/:"$moduleNameSingular"_id')
	.get("$moduleNamePlural"Controller.view) // view.ejs
	.put("$moduleNamePlural"Controller.update)
	.delete("$moduleNamePlural"Controller.remove);

	app.route(domainRoot + '/"$moduleNamePlural"/:"$moduleNameSingular"_id/edit')
	.get("$moduleNamePlural"Controller.edit); // edit.ejs

	app.route(domainRoot + '/"$moduleNamePlural"/:"$moduleNameSingular"_id/delete')
	.get("$moduleNamePlural"Controller.delete); // delete.ejs

	app.param('"$moduleNameSingular"_id', "$moduleNamePlural"Controller."$moduleNameSingular"ById);
	}" > app/$moduleNamePlural/routes/$moduleNamePlural.server.ui.route.js

	#API routes
	echo "var "$moduleNamePlural"Controller = require('../controllers/"$moduleNamePlural".server.controller.js');
	var domainRoot = '/api';
	module.exports = function(app){
	app.route(domainRoot + '/"$moduleNamePlural"')
	.get("$moduleNamePlural"Controller.home) // home.ejs
	.post("$moduleNamePlural"Controller.create);

	app.param('"$moduleNameSingular"_id', "$moduleNamePlural"Controller."$moduleNameSingular"ById);
	}" > app/$moduleNamePlural/routes/$moduleNamePlural.server.api.route.js

	#views
	echo "<!DOCTYPE html>
	<html>
	<head>
	<title><%= "$moduleNamePlural".title %></title>
	<meta name=\"description\" content=\"<%= "$moduleNamePlural".metaDescription %>\">
	<meta name=\"keywords\" content=\"<%=  "$moduleNamePlural".metaKeywords %>\">
	<meta name=\"author\" content=\"guyswhocode\">
	<% include ../../home/views/partials/styles.ejs %>
	<link rel=\"stylesheet\" href=\"/"$moduleNamePlural"/public/css/"$moduleNamePlural".css\">
	</head>
	<body>
	<h1><%= "$moduleNamePlural".title %></h1>
	<% include ../../home/views/partials/footer.ejs %>
	<% include ../../home/views/partials/scripts.ejs %>	
	</body>
	</html>" > app/$moduleNamePlural/views/add.ejs;

	cp app/$moduleNamePlural/views/add.ejs app/$moduleNamePlural/views/home.ejs
	cp app/$moduleNamePlural/views/add.ejs app/$moduleNamePlural/views/delete.ejs
	cp app/$moduleNamePlural/views/add.ejs app/$moduleNamePlural/views/edit.ejs
	cp app/$moduleNamePlural/views/add.ejs app/$moduleNamePlural/views/list.ejs
	cp app/$moduleNamePlural/views/add.ejs app/$moduleNamePlural/views/view.ejs

	echo "Created module $moduleNamePlural";
	;;

	help)
		echo "make module car cars Cars";
	;;
*)
	echo "Creating Module !";
	exit
esac