const User = require('mongoose').model('user');
const Contact = require('mongoose').model('contact');
const userValidation = require('../lib/users.validation.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AUTH_SECRET = process.env.AUTH_SECRET;

exports.home = function(req, res){
	res.render('users/views/home');
}

// Views auth users profile detials
exports.meViewAPI = function(req, res){
	User.findOne({ _id: res.locals.auth_user._id }, { password: 0 }, function(err, user){
		if (err || user==null || user==undefined)
			res.status(401).json(err);
		else{
			res.json(user);
		}
	});
}

// Finds a user from the database by its user_id
exports.userById = function(req, res, next, user_id){
	User.findOne({ _id: user_id }, function(err, user){
		if(err || user===null || user===undefined)
			res.status(404).json('');
		else{
			req.user_id = user._id; 
			next();
		}
	});
}

// Adds a user to the database using the given username and password
var signupUser = function(user, next, res) {
	let user_contact = new Contact();
	let user_contact_id;
	user_contact.save(function(err, new_contact){
		
		user_contact_id = new_contact._id
		user.contact = user_contact_id;

		User.addUser(user, function(err, user) {
			if (!err){
				const token = jwt.sign(
				{
					'user_id': user._id,
					'username': user.username, 
					'first_name': user.first_name,
					'role': user.role,
					'contact': user.contact
				},
				AUTH_SECRET,
				{
					algorithm: "HS256",
					expiresIn: 604800
				});

				res.cookie('access_token', token, { maxAge: 7*24*60*60*100, httpOnly: true });
				res.status(201).json({ 'msg': 'User added !', access_token: token });
			}
			else	
				res.status(500).json({ 'msg': 'Error in saving !' });
		});

	});
};

// List all users
exports.listUsersAPI = function(req, res){
	User.find({}, function(err, users_list){
		if (err || users_list==null || users_list==undefined)
			res.status(401).json(err);
		else{
			res.json(users_list);
		}
	});
}

// Adds a new user with the given user details
exports.create = function(req, res){
	var user_details = req.body;
	if(user_details.username && user_details.password)
		var new_user = new User(user_details);

	User.findOne({ $or: [{email : new_user.email},{username: new_user.username}]}, function(err, User){
		if(User==null || User==undefined){
			signupUser(new_user, null, res);
		}
		else{
			res.status(400).json({msg: "User exists !"});
		}
	});
}

// Authenticate user with the token given
exports.authenticate = function(req, res, next){
	const username = req.body.username;
	const password = req.body.password;

	User.getUserByUsername(username, (err, user) => {
		if(err) console.log(err, user);
		
		if(!user){
			return res.status(401).json({ msg: 'User not found'});
		}

		User.comparePassword(password, user.password, (err, isMatch) => {
			if(err) throw err;
			if(isMatch){				
				const token = jwt.sign(
				{ 
					'user_id': user._id,
					'username': user.username, 
					'role': user.role,
					'contact': user.contact
				}, 
				AUTH_SECRET, {
					algorithm: "HS256",
					expiresIn: 604800
				});
				res.cookie('access_token', token, { maxAge: 7*24*60*60*100, httpOnly: true });
				res.json({ 'access_token': token , 'redir': req.cookies.redir });
			} else {
				return res.status(401).json({ msg: 'Wrong password'});
			}
		});
	});
};


exports.hasRole = function(role) {
	return function(req, res, next) {
		if (role !== res.locals.auth_user.role) 
			res.status(403).json({ 'msg': 'You dont have privilages to access this.' });
		else 
			next();
	}
}

// Checks for valid JWT
exports.authorize = function(type) {
	return function(req, res, next) {
		if (res.locals.auth_user) {
			next();
		}
		else{
			if(type == 'api')
				res.status(403).json({ 'msg': 'Please login !' });
			else if(type == 'ui'){
				res.cookie('redir', req.originalUrl);
				res.redirect('/signin');
			}
		}
	}
}

// Signs Out user by clearing the cookies.
exports.signout = function(req, res){
	res.clearCookie('access_token');
	res.send({ 'msg': 'Signed out !' });
}

exports.signinUI = function(req, res){
	res.render('users/views/signin');
}

exports.signupUI = function(req, res){
	res.render('users/views/signup');
}

exports.signoutUI = function(req, res){
	res.render('users/views/signout');
}