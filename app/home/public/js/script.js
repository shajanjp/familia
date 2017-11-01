$('a.signout').on('click', function(e){
	e.preventDefault();
	$.ajax({
		url: '/api/signout',
		type: 'GET',
		success: function(data, status, xhr){
			if(xhr.status == 200){
				window.location = "/signout";
			}
		}
	})
});

$('.ui.menu .dropdown').dropdown();
$('#navbar-search-contacts')
.search({
	apiSettings: {
		url: '/api/contacts/list?q={query}'
	},
	fields: {
		results : 'results',
		title : 'full_name',
		url : 'url',
		image : 'avatar',
		description : 'description'
	},
	minCharacters : 3
});