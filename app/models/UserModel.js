var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'phone' : String,
	'email': String,
    'login_codes' : {type: [String]},
	'login_code': String,
	'last_login' : Date,
	'verified': {type: Boolean, default: false},
	'verified_on': {type: Date},
	'verification_code': String,
    'role' : String,
	'created_on' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('User', UserSchema);