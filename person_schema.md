## Person
full_name : String,
gender: String,
date_of_birth : Date,
anniversaries : [{
	type : ["death", "wedding", "feast"],
	day : Date
	}],
relation : ["son", "daughter", "wife", "brother", "sister"],
phone : Number,
avatar : String,
is_dead : Boolean

## House
master : person_id
home_latlong : String,
address : {
	line_1: String,
	line_2: String,
	landmark: String,
	city: String,
	district: String,
	zip: String }
}