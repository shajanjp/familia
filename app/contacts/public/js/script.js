var reverse_relarion = function(relation){
	switch(relation){
		case "dad" :
		case "mom" :
		return "child";
		break;
		case "daughter" :
		case "son" :
		return "parent";
		break;
		case "brother" :
		case "sister" :
		return "parent";
		break;
		case "wife" :
		return "husband";
		break;
		case "husband" :
		return "wife";
		break;
		default:
		return "";
		break;
	}
}

function removeContact(contact_id, cb){	
	$.ajax({
		type: "DELETE",
		url: '/api/contacts/' + contact_id,
		contentType: false,
		success: function(data, status, xhr){
			if(xhr.status == 200){
				cb();
			}
		}
	});
}

function removeHouse(house_id, cb){
	$.ajax({
		type: "DELETE",
		url: '/api/houses/' + house_id,
		contentType: false,
		success: function(data, status, xhr){
			if(xhr.status == 200){
				cb();
			}
		}
	});
}

$('.remove-house').on('click', function(e){
	e.preventDefault();
	let house_id = $(this).data('house-id');
	removeHouse(house_id, function(){
		window.location = "/houses/list";
	});
});

$('.remove-contact').on('click', function(e){
	e.preventDefault();
	let contact_id = $(this).data('contact-id');
	removeContact(contact_id, function(){
		window.location = "/contacts/list";
	});
});

$('.contacts-table .remove-contact').on('click', function(){
	var contact_row = $(this).closest('tr');
	var contact_id = contact_row.data('contact-id');
	removeContact(contact_id, function(){
		contact_row.remove();
	});
});