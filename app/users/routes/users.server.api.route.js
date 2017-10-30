var usersController = require('../controllers/users.server.controller.js');
var domainRoot = '/api';

module.exports = function(app){

	app.route(domainRoot + '/auth')
	.get(usersController.home)
	.post(usersController.authenticate);

	app.route(domainRoot + '/signin')
	.post(usersController.authenticate)

	app.route(domainRoot + '/signup')
	.post(usersController.create);

	app.route(domainRoot + '/signout')
	.get(usersController.signout);

	app.route(domainRoot + '/me')
	.get(usersController.authorize, usersController.meViewAPI);

	app.route(domainRoot + '/users')
	.get(usersController.authorize, usersController.listUsersAPI)
	.post(usersController.home);

	app.param('user_id', usersController.userById);
}