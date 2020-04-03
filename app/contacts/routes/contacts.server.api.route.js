const contactsController = require('../controllers/contacts.server.controller.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const domainRoot = '/api';

module.exports = function(app){
	app.route(domainRoot + '/contacts')
	.get(contactsController.listContactAPI)
	.post(upload.single('avatar'), contactsController.createContactAPI);

	app.route(domainRoot + '/houses')
	.post(contactsController.createHouseAPI);

	app.route(domainRoot + '/houses/:house_id')
	.delete(contactsController.removeHouseAPI);
	
	app.route(domainRoot + '/contacts/list')
	.get(contactsController.fetchContactAPI);

	app.route(domainRoot + '/contacts/:contact_id')
	.get(contactsController.viewContactAPI)
	.put(upload.single('avatar'), contactsController.updateContactAPI)
	.delete(contactsController.removeContactAPI);

	app.param('contact_id', contactsController.contactById);
	app.param('house_id', contactsController.houseById);

}