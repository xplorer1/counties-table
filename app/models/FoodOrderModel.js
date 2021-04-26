var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var FoodOrderSchema = new Schema({
    'customer' : {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
	'createdon' : {type: Date, default: Date.now},
	'lastupdated' : {type: Date},
	'balance' : {type: Number, default: 0},
	'item': {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }
});

module.exports = mongoose.model('FoodOrder', FoodOrderSchema);