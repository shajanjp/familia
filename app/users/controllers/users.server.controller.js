var User = require('mongoose').model('user');
var userValidation = require('../lib/users.validation.js');

exports.home = function(req, res){
	res.render('users/views/home');
}