var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var FoodOrderSchema = new Schema({
    'customer_phone' : String,
    'restaurant_id' : {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    'delivery_agent': String,
    'quantity' : {type: Number},
    'order_cost': Number,
	'item_id': {
        type: Schema.Types.ObjectId,
        ref: 'Menu'
    },
    'delivery_address' : String,
    'order_status': String,
    'created_on' : {type: Date, default: Date.now},
	'last_updated' : {type: Date}
});

module.exports = mongoose.model('FoodOrder', FoodOrderSchema);