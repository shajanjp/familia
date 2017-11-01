var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	id : Schema.ObjectId,
	username: String,
	password: String,
	email: String,
	role: String,
	contact: { type: Schema.ObjectId, ref: 'contact' }
});

const User = module.exports = mongoose.model('user', userSchema);

module.exports.getUserById = function(id){
	User.findById(id, { password: 0 }, callback);
}

module.exports.getUserByUsername = function(username, callback){
	const query = { username: username }
	User.findOne(query, callback);
}

module.exports.getUserByEmail = function(emil, callback){
	const query = { email: email }
	User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback){
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			if(err) throw err;
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
		if(err) throw err;
		callback(null, isMatch);
	});
}