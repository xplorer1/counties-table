var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var PreSignUpSchema = new Schema({
	'email' : {type: String, lowercase: true},
	'created_on' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('PreSignUp', PreSignUpSchema);