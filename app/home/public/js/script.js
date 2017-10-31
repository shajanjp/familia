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