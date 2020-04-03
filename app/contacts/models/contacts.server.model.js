const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
	full_name: String,
	nick_name: String,
	gender: String,
	anniversaries: [{
		title: String,
		day: Date
	}],
	relation_to_contact: String,
	related_to_contact: { type: Schema.ObjectId, ref: 'contact' },
	phone: String,
	email: String,
	avatar: String,
	owners: [{ type: Schema.ObjectId, ref: 'user' }],
	is_dead: Boolean
});

const Contact = module.exports = mongoose.model('contact', contactSchema);

module.exports.getContactById = function(contact_id){
	let contact_details;
	Contact.findOne(contact_id, function(err, contact){
		if (err || contact==null || contact==undefined)
			contact_details = {};
		else{
			contact_details = contact;
		}
	});
	return contact_details;
}