var contactsController = require('../controllers/contacts.server.controller.js');
var domainRoot = '';

module.exports = function(app){
	app.route('/dashboard')
	.get(contactsController.viewStatisticsUI);
	
	app.route(domainRoot + '/contacts')
	.get(contactsController.contactsDashboardUI);

	app.route(domainRoot + '/houses')
	.get(contactsController.housesDashboardUI);

	app.route(domainRoot + '/houses/add')
	.get(contactsController.addHouseUI);

	app.route(domainRoot + '/houses/list')
	.get(contactsController.listHousesUI);

	app.route(domainRoot + '/houses/:house_id')
	.get(contactsController.viewHouseUI);
	
	app.route(domainRoot + '/contacts/list') 
	.get(contactsController.listContactUI);

	app.route(domainRoot + '/contacts/add')
	.get(contactsController.addContactUI); // add.ejs

	app.route(domainRoot + '/contacts/:contact_id')
	.get(contactsController.viewContactUI) // view.ejs
	.put(contactsController.home)
	.delete(contactsController.home);

	app.route(domainRoot + '/contacts/:contact_id/edit')
	.get(contactsController.editContactUI);

	app.route(domainRoot + '/contacts/:contact_id/delete')
	.get(contactsController.home); // delete.ejs

	app.param('contact_id', contactsController.contactById);
	app.param('house_id', contactsController.houseById);
}
