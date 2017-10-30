var activeModules = require('./modules.js').activeModules;
var moduleLocals = function(){
	var moduleDetails = {};
	activeModules.forEach( function(module) {
		moduleDetails[module.name] = require('../app/' + module.name + '/config/' + module.name + '.locals.json');
	});
	return moduleDetails;
}
exports.moduleLocals = moduleLocals();