var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var CustomerSchema = new Schema({
	'phone': String,
	'orders' : {type: [String]},
	'created_on' : {type: Date, default: new Date()}
});

module.exports = mongoose.model('Customer', CustomerSchema);