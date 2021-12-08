 // grab the packages that we need for the user model
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;

var PaystackLogSchema = new Schema({
	log: { type: Schema.Types.Mixed },
	created: { type: Date, default: Date.now }
});

 module.exports = mongoose.model('PaystackLog', PaystackLogSchema);