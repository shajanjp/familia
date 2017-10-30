var User = require('mongoose').model('user');
var userValidation = require('../lib/users.validation.js');
var config = require('../../../config/env/' + process.env.NODE_ENV + '.js');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

exports.home = function(req, res){
	res.render('users/views/home');
}

// Views auth users profile detials
exports.meViewAPI = function(req, res){
	User.findOne({ _id: req.auth_user._id }, { password: 0 }, function(err, user){
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
	User.addUser(user, function(err, user) {
		if (!err)
			res.status(201).send("User added !");
		else	
			res.status(500).json({ msg: "Error in saving !"});
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
					'first_name': user.first_name,
					'role': user.role
				}, 
				config.auth_secret, {
					algorithm: "HS256",
					expiresIn: 604800 // 1 week,
				});

				res.cookie('access_token', token, { maxAge: 7*24*60*60*100, httpOnly: true });
				res.json({ access_token: token });

			} else {
				return res.status(401).json({ msg: 'Wrong password'});
			}
		});
	});
};


// Signs in user with the given username and password
exports.authorize = function(req, res, next){
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.cookies && req.cookies.access_token) || req.headers['x-access-token'];
	jwt.verify(token, config.auth_secret, function(err, decoded) {
		if (err) { 
			return res.status(403).send({ 'msg': "Please login."});
		} else
		{
			req.auth_user = {};
			req.auth_user._id = decoded.user_id;
			next();
		}
	});
}

// Signs Out user by clearing the cookies.
exports.signout = function(req, res){
	res.clearCookie('access_token');
	res.send({ 'msg': 'Signed out !' });
}