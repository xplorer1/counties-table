var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RestaurantSchema = new Schema({
	'email' : {type: String, lowercase: true},
	'business_name': String,
	'first_name': String,
	'last_name': String,
	'address': String,
	'phone': String,
	'cover_image': String,
	'profile_image': String,
	'whatsapp_link': String,
	'streameats_link': String,
	'streameats_id': String,
	'number_of_streams': Number,
	'verified': {type: Boolean, default: false},
	'created_on' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);