var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RestaurantSchema = new Schema({
	'email' : {type: String, lowercase: true},
	'businessname': String,
	'firstname': String,
	'lastname': String,
	'address': String,
	'phone': String,
	'whatsapplink': String,
	'streameatslink': String,
	'createdon' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);