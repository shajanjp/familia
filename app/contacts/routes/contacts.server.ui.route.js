var contactsController = require('../controllers/contacts.server.controller.js');
var usersController = require('../../users/controllers/users.server.controller.js');
var domainRoot = '';

module.exports = function(app){
	app.route('/dashboard')
	.get(contactsController.viewStatisticsUI);

	app.route(domainRoot + '/me')
	.get(contactsController.viewMyProfileUI);
	
	app.route(domainRoot + '/contacts')
	.get(contactsController.contactsDashboardUI);

	app.route(domainRoot + '/anniversaries')
	.get(contactsController.anniversariesSchedule);

	app.route(domainRoot + '/houses')
	.get(contactsController.housesDashboardUI);

	app.route(domainRoot + '/houses/add')
	.get(contactsController.addHouseUI);

	app.route(domainRoot + '/houses/list')
	.get(contactsController.listHousesUI);

	app.route(domainRoot + '/houses/:house_id')
	.get(contactsController.viewHouseUI);
	
	app.route(domainRoot + '/contacts/list') 
	.get(usersController.authorize, contactsController.listContactUI);

	app.route(domainRoot + '/contacts/welcome') 
	.get(usersController.authorize, contactsController.welcomeContactUI);

	app.route(domainRoot + '/contacts/add')
	.get(contactsController.addContactUI);

	app.route(domainRoot + '/contacts/:contact_id')
	.get(contactsController.viewContactUI)
	.put(contactsController.home)
	.delete(contactsController.home);

	app.route(domainRoot + '/contacts/:contact_id/edit')
	.get(contactsController.editContactUI);

	app.route(domainRoot + '/contacts/:contact_id/delete')
	.get(contactsController.home);

	app.param('contact_id', contactsController.contactById);
	app.param('house_id', contactsController.houseById);
}
