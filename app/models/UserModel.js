var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
	'email' : {type: String, lowercase: true},
	'phone' : false,
    'logincodes' : {type: [String]},
	'logincodes': String,
    'role' : String,
	'createdon' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('User', UserSchema);