var homeController = require('../controllers/home.server.controller.js');
var contactsController = require('../../contacts/controllers/contacts.server.controller.js');

module.exports = function(app){
	app.route('/')
	.get(contactsController.contactsDashboardUI);
}