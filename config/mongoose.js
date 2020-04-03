const config = require('./env/'+ process.env.NODE_ENV +'.js');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = bluebird;

const activeModules = require('./modules.js').activeModules;
let moduleModels;

module.exports = function(){
	const db = mongoose.connect(config.db, { 
		useNewUrlParser: true,
		useUnifiedTopology: true 
	});
	console.log("registering mongoDB schemas...");
	activeModules.forEach(function(module) {
		moduleModels = require('../app/' + module.name + '/config/' + module.name + '.locals.json').models;
		if(moduleModels != undefined){
			moduleModels.forEach(function(modelFile){
				require('../app/'+ module.name + '/models/' + modelFile);
				console.log("registering " + modelFile);
			});
		}
	});
	return db;
};