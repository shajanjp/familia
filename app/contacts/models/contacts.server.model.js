var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var contactSchema = new Schema({
	full_name: String,
	nick_name: String,
	gender: String,
	anniversaries: [{
		title: String,
		day: Date
	}],
	relation_to_contact: String,
	related_to_contact: { type: Schema.ObjectId, ref: 'contact'},
	phone: String,
	email: String,
	avatar: String, 
	is_dead: Boolean
});

mongoose.model('contact', contactSchema);
