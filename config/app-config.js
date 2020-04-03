const activeModules = require('./modules.js').activeModules;
const moduleLocals = function(){
	const moduleDetails = {};
	activeModules.forEach( function(module) {
		moduleDetails[module.name] = require('../app/' + module.name + '/config/' + module.name + '.locals.json');
	});
	return moduleDetails;
}
exports.moduleLocals = moduleLocals();