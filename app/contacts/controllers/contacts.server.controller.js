const Contact = require('mongoose').model('contact');
const House = require('mongoose').model('house');
const contactValidation = require('../lib/contacts.validation.js');
const moment = require('moment');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');


exports.contactById = function(req, res, next, contact_id){
	Contact.findOne({ _id: contact_id })
	.then((contact) => {
			res.locals.contact_id = contact._id;
			return Promise.resolve(next());
	})
	.catch((err) => {
			return res.status(404).json({ 'msg':'Invalid Contact !' });
	});
}

exports.houseById = function(req, res, next, house_id){
	House.findOne({ _id: house_id }, function(err, house){
		if(err || house===null || house===undefined)
			res.status(404).json({ 'msg':'Invalid House !' });
		else{
			res.locals.house_id = house._id;
			next();
		}
	});
}

exports.listContactUI = function(req, res){
	Contact.find({ 'owners': res.locals.auth_user._id })
	.populate({ path: 'related_to_contact', select: 'full_name _id' })
	.then((contacts_list) => {
		res.render('contacts/views/list-contacts', { contacts_list: contacts_list, moment: moment });
	})
	.catch((err) => {
		res.status(401).json(err);
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

	req.body.is_dead = (req.body.is_dead == 'true') ? true : false;

	if(req.body.anniversaries){
		if (req.body.anniversaries[0].day == "" || req.body.anniversaries[0].day == null) {
			delete req.body.anniversaries;
		}
	}
	
	let contact = new Contact(req.body);
	contact.owners = [];
	contact.owners.push(res.locals.auth_user._id);

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
	if (!req.body.anniversaries || req.body.anniversaries[0].day == "" || req.body.anniversaries[0].day == null) {
		delete req.body.anniversaries;
	}
	if(req.file){
		req.body.avatar = res.locals.contact_id + '-avatar.jpg';
	}
	Contact.findOneAndUpdate({ _id: res.locals.contact_id }, req.body, { safe: true, upsert: true }, function(err, doc){
		if (err) {
			console.log(err);
			res.status(500).json({ 'success': false, 'msg': 'Error in updating !' });
		}
		else{
			if(req.file){
				gm(req.file.path)
				.resize(200, 200)
				.quality(90)
				.write('app/contacts/public/uploads/avatars/' + res.locals.contact_id + '-avatar.jpg', function (err) {
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
	.then((contact_list) => {
		res.json(contact_list);
	})
	.catch((err) => {
		res.status(401).json({ err: err });
	});
}

exports.fetchContactAPI = function(req, res){
	var search = new RegExp('^(.* |)'+ req.query.q +'.*$', "i");
	Contact.find({owners: res.locals.auth_user._id, $or:[{ full_name: search }, { nick_name: search }, { phone: search }]}, {_id: 1, full_name: 1, avatar: 1, related_to_contact: 1, relation_to_contact: 1})
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
				temp_con.avatar = con.avatar ? `/contacts/public/uploads/avatars/${con.avatar}` : '/home/public/img/avatar.jpg';
				temp_con.url = '/contacts/' + con._id;
				temp_con._id = con._id;
				arranged_contact_list.push(temp_con);
			});
			res.json({success:true, results: arranged_contact_list})		
		}
	});
}

exports.viewContactUI = function(req, res){
	Contact.findOne({ _id: res.locals.contact_id })
	.populate({ path: 'related_to_contact' })
	.then((contact) => {
		Contact.find({ related_to_contact: contact._id }, function(err, related_contacts){
			if (err || related_contacts==null || related_contacts==undefined)
				res.status(401).json({ 'err': err });
			else{
				res.render('contacts/views/view-contact', { contact: contact, related_contacts: related_contacts, moment:moment });
			}
		});
	})
	.catch((err) => {
		if (err || contact==null || contact==undefined)
			res.status(401).json({ 'err': err });
	});
}

exports.viewContactAPI = function(req, res){
	Contact.findOne({ _id: res.locals.contact_id })
	.then((contact) => {
		res.json(contact);
	})
	.catch((err) => {
		if (err || contact==null || contact==undefined)
			res.status(401).json({ 'err': err });
	})
}

exports.editContactUI = function(req, res){
	Contact.findOne({ _id: res.locals.contact_id })
	.then((contact) => {
		res.render('contacts/views/edit-contact', { contact: contact, moment: moment });
	})
	.catch((err) => {
		if (err || contact==null || contact==undefined)
			res.status(401).json({ 'err': err });
	});
}

exports.contactsDashboardUI = function(req, res){
	Contact.find({owners: res.locals.auth_user._id})
	.then((contacts_list) => {
		res.render('contacts/views/contacts-dashboard', { contacts_list: contacts_list });
	})
	.catch((err) => {
		res.status(401).json({ 'err': err });
	});
}

exports.home = function(req, res){
	res.send("Home");
}

exports.removeContactAPI = function(req, res){
	Contact.remove({ _id: res.locals.contact_id })
	.then((contact) => {
		Contact.update({ related_to_contact: res.locals.contact_id }, { $unset: {related_to_contact: 1, relation_to_contact: 1}}, { safe:true }, function(err, doc){
			if (err) 
				res.status(500).json({ 'err': err });
			else
				res.status(200).json({ 'msg': 'Contact Removed !', 'success': true });
		});
	})
	.catch((err) => {
		res.json(err);
	});
}

exports.housesDashboardUI = function(req, res){
	res.render('contacts/views/add-house');
}

exports.addHouseUI = function(req, res){
	res.render('contacts/views/add-house');
}

exports.createHouseAPI = function(req, res){
	var house = new House(req.body);
	house.save()
	.then((house) => {
		res.status(201).json({ 'msg': 'House added !', house_id: house._id });
	})
	.catch((err) => {
		res.status(500).json({ 'err': err });
	});
}

exports.listHousesUI = function(req, res){
	House.find({})
	.populate({ path: 'head_contact', select: 'full_name avatar _id' })
	.then((house_list) => {
		res.render('contacts/views/list-houses', { house_list: house_list });
	})
	.catch((err) => {
		res.status(401).json({ 'err': err });
	});
} 

exports.viewHouseUI = function(req, res){
	House.findOne({ _id: res.locals.house_id })
	.populate({ path: 'contacts', select: 'full_name avatar relation_to_contact _id' })
	.populate({ path: 'head_contact', select: 'full_name avatar _id' })	
	.then((house) => {
		res.render('contacts/views/view-house', { house: house });
	})
	.catch((err) => {
		res.status(401).json({ 'err': err });
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
	}])
	.then((result) => {
		res.json(result);
	})
	.catch((err) => {
		res.json({ 'err': err });
	});
}

exports.removeHouseAPI = function(req, res){
	House.remove({ _id: res.locals.house_id })
	.then(() => {
		res.json({ 'msg': 'House Removed !', 'success': true });
	})
	.catch((err) => {
		res.json({'err': err});
	});
}

exports.anniversariesSchedule = function(req, res){
	Contact.aggregate([ 
	{ 
		$project: { full_name:1, 'anniversaries.day': 1,'anniversaries.title': 1 }  
	},
	{  
		$unwind: "$anniversaries"  
	},
	{   
		$project: { full_name: 1, title: '$anniversaries.title', day: { $dateToString: { format: "%m-%d", date: "$anniversaries.day" } } } 
	},
	{
		$sort: { day: 1 }  
	}])
	.then((anniversaries_list) => {
		res.render('contacts/views/upcoming_anniversaries', { anniversaries_list: anniversaries_list, moment: moment });
	})
	.catch((err) => {
		if(err)
			res.json({ 'err': err });
	});
}

exports.welcomeContactUI = function(req, res){
	Contact.findOne({ _id: res.locals.auth_user.contact })
	.then((contact) => {
		res.render('contacts/views/welcome-contact', { contact: contact });
	})
	.catch((err) => {
		res.render('contacts/views/welcome-contact', { contact: {} });
	});
}

exports.viewMyProfileUI = function(req, res){
	Contact.findOne({ _id: res.locals.auth_user.contact })
	.populate({ path: 'related_to_contact' })
	.then((contact) => {
		Contact.find({ related_to_contact: contact._id }, function(err, related_contacts){
			if (err || related_contacts==null || related_contacts==undefined)
				res.status(401).json({ 'err': err });
			else
				res.render('contacts/views/view-contact', { contact: contact, related_contacts: related_contacts, moment:moment });
		})
	})
	.catch((err) => {
		res.redirect('/contacts/welcome');
	})
}