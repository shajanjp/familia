var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var houseSchema = new Schema({
	title: String,
	place: String,
	landmark: String,
	latlong: String,
	head_contact: { type: Schema.ObjectId, ref: 'contact'},
	contacts: [{ type: Schema.ObjectId, ref: 'contact'}],
	phone: String
});

mongoose.model('house', houseSchema);