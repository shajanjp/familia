const homeController = require('../controllers/home.server.controller.js');
const contactsController = require('../../contacts/controllers/contacts.server.controller.js');
const usersController = require('../../users/controllers/users.server.controller.js');

module.exports = function(app){
	app.route('/')
	.get(usersController.authorize('ui'), contactsController.contactsDashboardUI);

  app.route('/add-contact')
  .get(contactsController.addContactNoAuth);
}