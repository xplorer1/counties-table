var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var CustomerSchema = new Schema({
	'address': String,
	'phone': String,
	'orders' : {type: [String]},
	'createdon' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('Customer', CustomerSchema);