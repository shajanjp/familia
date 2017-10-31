var usersController = require('../controllers/users.server.controller.js');
var domainRoot = '';

module.exports = function(app){

	app.route(domainRoot + '/users')
	.get(usersController.home)
	.post(usersController.home);

	app.route(domainRoot + '/signin')
	.get(usersController.signinUI);

	app.route(domainRoot + '/signup')
	.get(usersController.signupUI);

	app.param('user_id', usersController.userById);
}
