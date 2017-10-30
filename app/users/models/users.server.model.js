var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var userSchema = new Schema({
	id : Schema.ObjectId
});

mongoose.model('user', userSchema);
