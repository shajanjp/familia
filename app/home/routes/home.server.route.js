var homeController = require('../controllers/home.server.controller.js');
var contactsController = require('../../contacts/controllers/contacts.server.controller.js');
var usersController = require('../../users/controllers/users.server.controller.js');

module.exports = function(app){
	app.route('/')
	.get(usersController.authorize('ui'), contactsController.contactsDashboardUI);
}