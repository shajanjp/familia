const contactsController = require('../controllers/contacts.server.controller.js');
const usersController = require('../../users/controllers/users.server.controller.js');
const domainRoot = '';

module.exports = function(app){
	app.route('/dashboard')
	.get(contactsController.viewStatisticsUI);

	app.route(domainRoot + '/me')
	.get(usersController.authorize('ui'), contactsController.viewMyProfileUI);
	
	app.route(domainRoot + '/contacts')
	.get(usersController.authorize('ui'), contactsController.contactsDashboardUI);

	app.route(domainRoot + '/anniversaries')
	.get(usersController.authorize('ui'), contactsController.anniversariesSchedule);

	app.route(domainRoot + '/houses')
	.get(contactsController.housesDashboardUI);

	app.route(domainRoot + '/houses/add')
	.get(usersController.authorize('ui'), contactsController.addHouseUI);

	app.route(domainRoot + '/houses/list')
	.get(usersController.authorize('ui'), contactsController.listHousesUI);

	app.route(domainRoot + '/houses/:house_id')
	.get(usersController.authorize('ui'), contactsController.viewHouseUI);
	
	app.route(domainRoot + '/contacts/list') 
	.get(usersController.authorize('ui'), contactsController.listContactUI);

	app.route(domainRoot + '/contacts/welcome') 
	.get(usersController.authorize('ui'), contactsController.welcomeContactUI);

	app.route(domainRoot + '/contacts/add')
	.get(usersController.authorize('ui'), contactsController.addContactUI);

	app.route(domainRoot + '/contacts/:contact_id')
	.get(usersController.authorize('ui'), contactsController.viewContactUI);

	app.route(domainRoot + '/contacts/:contact_id/edit')
	.get(usersController.authorize('ui'), contactsController.editContactUI);

	app.route(domainRoot + '/contacts/:contact_id/delete')
	.get(contactsController.home);

	app.param('contact_id', contactsController.contactById);
	app.param('house_id', contactsController.houseById);
}