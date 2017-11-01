var Contact = require('mongoose').model('contact');
var House = require('mongoose').model('house');
var contactValidation = require('../lib/contacts.validation.js');
var moment = require('moment');
var gm = require('gm').subClass({imageMagick: true});
var fs = require('fs');

exports.contactById = function(req, res, next, contact_id){
	Contact.findOne({ _id: contact_id }, function(err, contact){
		if(err || contact===null || contact===undefined)
			res.status(404).json({ 'msg':'Invalid Contact !' });
		else{
			req.contact_id = contact._id;
			next();
		}
	});
}

exports.houseById = function(req, res, next, house_id){
	House.findOne({ _id: house_id }, function(err, house){
		if(err || house===null || house===undefined)
			res.status(404).json({ 'msg':'Invalid House !' });
		else{
			req.house_id = house._id;
			next();
		}
	});
}

exports.listContactUI = function(req, res){
	Contact.find({})
	.populate({ path: 'related_to_contact', select: 'full_name _id' })
	.exec(function(err, contacts_list){
		if (err || contacts_list==null || contacts_list==undefined)
			res.status(401).json(err);
		else{
			res.render('contacts/views/list-contacts', { contacts_list: contacts_list, moment: moment });
		}
	});
}

exports.addContactUI = function(req, res){
	res.render('contacts/views/add-contact');
}

exports.createContactAPI = function(req, res){
	if (req.body.relation_to_contact == 'none'){
		delete req.body.relation_to_contact;
		delete req.body.related_to_contact;
	}
	if (req.body.anniversaries[0].day == "" || req.body.anniversaries[0].day == null) {
		delete req.body.anniversaries;
	}
	var contact = new Contact(req.body);
	if(req.file){
		contact.avatar = contact._id + '-avatar.jpg';
	}
	contact.save(function(err, contact){
		if(err)
			res.json(err);
		else{
			if(req.file){
				gm(req.file.path)
				.resize(200, 200)
				.quality(90)
				.write('app/contacts/public/uploads/avatars/' + contact._id + '-avatar.jpg', function (err) {
					if (err)
						res.json(err);
					else{
						fs.unlink(req.file.path);
						res.status(201).json({ 'msg': 'Contact Added !', contact_id: contact._id });
					}
				});
			}
			else{
				res.status(201).json({ 'msg': 'Contact Added !', contact_id: contact._id });

			}
		}
	});
}

exports.updateContactAPI = function(req, res){
	if (req.body.relation_to_contact == 'none'){
		delete req.body.relation_to_contact;
		delete req.body.related_to_contact;
	}
	if (req.body.anniversaries[0].day == "" || req.body.anniversaries[0].day == null) {
		delete req.body.anniversaries;
	}
	if(req.file){
		req.body.avatar = req.contact_id + '-avatar.jpg';
	}
	Contact.findOneAndUpdate({ _id: req.contact_id }, req.body, { safe: true, upsert: true }, function(err, doc){
		if (err) {
			console.log(err);
			res.status(500).json({ 'success': false, 'msg': 'Error in updating !' });
		}
		else{
			if(req.file){
				gm(req.file.path)
				.resize(200, 200)
				.quality(90)
				.write('app/contacts/public/uploads/avatars/' + req.contact_id + '-avatar.jpg', function (err) {
					if (err){
						res.status(500).json({ 'success': false, 'msg': 'Error in updating !' });
					}
					else{
						fs.unlink(req.file.path);
						res.status(201).json({ 'success': true, 'msg': 'Contact Updated !' });
					}
				});
			}
			else{
				res.status(201).json({ 'success': true, 'msg': 'Contact Updated !' });
			}
		}
	});
}

exports.listContactAPI = function(req, res){
	Contact.find({})
	.populate({ path: 'related_to_contact', select: 'full_name _id' })
	.exec()
	.then(function(contact_list){
		res.json(contact_list)
	})
	.catch(function(err){
		res.status(401).json({ err: err });
	});
}

exports.fetchContactAPI = function(req, res){
	var search = new RegExp('^(.* |)'+ req.query.q +'.*$', "i");
	Contact.find({$or:[{ full_name: search }, { nick_name: search }, { phone: search }]}, {_id: 1, full_name: 1, avatar: 1, related_to_contact: 1, relation_to_contact: 1})
	.populate({ path: 'related_to_contact', select: '_id full_name' })
	.exec(function(err, contact_list){
		if (err || contact_list==null || contact_list==undefined)
			res.status(401).json(err);
		else{
			var arranged_contact_list = [];
			contact_list.forEach(function(con){
				var temp_con = {};
				temp_con.full_name = con.full_name;
				if(con.related_to_contact)
					temp_con.description = con.related_to_contact.full_name + "'s " + con.relation_to_contact;
				temp_con.avatar = '/contacts/public/uploads/avatars/' + (con.avatar || 'default.jpg');
				temp_con.url = '/contacts/' + con._id;
				temp_con._id = con._id;
				arranged_contact_list.push(temp_con);
			});
			res.json({success:true, results: arranged_contact_list})		
		}
	});
}

exports.viewContactUI = function(req, res){
	Contact.findOne({ _id: req.contact_id })
	.populate({ path: 'related_to_contact' })
	.exec(function(err, contact){
		if (err || contact==null || contact==undefined)
			res.status(401).json(err);
		else{
			Contact.find({ related_to_contact: contact._id }, function(err, related_contacts){
				if (err || related_contacts==null || related_contacts==undefined)
					res.status(401).json({ 'err': err });
				else{
					res.render('contacts/views/view-contact', { contact: contact, related_contacts: related_contacts, moment:moment });
				}
			});
		}
	});
}

exports.viewContactAPI = function(req, res){
	Contact.findOne({ _id: req.contact_id }, function(err, contact){
		if (err || contact==null || contact==undefined)
			res.status(401).json({ 'err': err });
		else{
			res.json(contact);
		}
	});
}

exports.editContactUI = function(req, res){
	Contact.findOne({ _id: req.contact_id }, function(err, contact){
		if (err || contact==null || contact==undefined)
			res.status(401).json({ 'err': err });
		else{
			res.render('contacts/views/edit-contact', { contact: contact, moment: moment });
		}
	});
}

exports.contactsDashboardUI = function(req, res){
	Contact.find({}, function(err, contacts_list){
		if (err || contacts_list==null || contacts_list==undefined)
			res.status(401).json({ 'err': err });
		else{
			res.render('contacts/views/contacts-dashboard', { contacts_list: contacts_list });
		}
	}).limit(6);
}

exports.home = function(req, res){
	res.send("Home");
}

exports.removeContactAPI = function(req, res){
	Contact.remove({ _id: req.contact_id }, function(err){
		if (err)
			res.json(err);
		else {
			Contact.update({ related_to_contact: req.contact_id }, { $unset: {related_to_contact: 1, relation_to_contact: 1}}, { safe:true }, function(err, doc){
				if (err) 
					res.status(500).json({ 'err': err });
				else
					res.status(200).json({ 'msg': 'Contact Removed !', 'success': true });
			});
		}
	});
}

exports.housesDashboardUI = function(req, res){
	res.render('contacts/views/add-house');
}


exports.addHouseUI = function(req, res){
	res.render('contacts/views/add-house');
}

exports.createHouseAPI = function(req, res){
	console.log(req.body);
	var house = new House(req.body);
	house.save(function(err, house){
		if(err)
			res.status(500).json({ 'err': err });
		else
			res.status(201).json({ 'msg': 'House added !', house_id: house._id });
	});
}

exports.listHousesUI = function(req, res){
	House.find({})
	.populate({ path: 'head_contact', select: 'full_name avatar _id' }) 
	.exec(function(err, house_list){
		if (err || house_list==null || house_list==undefined)
			res.status(401).json({ 'err': err });
		else{
			res.render('contacts/views/list-houses', { house_list: house_list });
		}
	});
} 

exports.viewHouseUI = function(req, res){
	House.findOne({ _id: req.house_id })
	.populate({ path: 'contacts', select: 'full_name avatar relation_to_contact _id' })
	.populate({ path: 'head_contact', select: 'full_name avatar _id' })
	.exec(function(err, house){
		if (err || house==null || house==undefined)
			res.status(401).json({ 'err': err });
		else{
			res.render('contacts/views/view-house', { house: house });
		}
	});
}

exports.viewStatisticsUI = function(req, res){
	Contact.aggregate([
	{
		$project: {
			male: {$cond: [{$eq: ["$gender", "male"]}, 1, 0]},
			female: {$cond: [{$eq: ["$gender", "female"]}, 1, 0]},
		}
	},
	{
		$group: { 
			_id: null, 
			male: { $sum: "$male" },
			female: {$sum: "$female"},
			total: {$sum: 1}
		}
	}], function(err, result){
		res.json(result);
	});
}

exports.removeHouseAPI = function(req, res){
	House.remove({ _id: req.house_id }, function(err){
		if (err)
			res.json({'err': err});
		else{
			res.json({ 'msg': 'House Removed !', 'success': true });
		}
	});
}

exports.anniversariesSchedule = function(req, res){
	Contact.find().sort({ 'anniversaries.day': -1 }).exec(function(err, contacts_list){
		if(err)
			res.json({ 'err': err });
		else
			res.json(contacts_list);
	});
}

exports.welcomeContactUI = function(req, res){
	res.render('contacts/views/welcome-contact');
}