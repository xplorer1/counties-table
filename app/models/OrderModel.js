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
    'delivery_latitude': String,
    'delivery_longitude': String,
    'pickup_address': String,
    'pickup_latitude': String,
    'pickup_longitude': String,
    'delivery_name': String,
    'delivery_phone': String,
    'delivery_email': String,
    'pickup_name': String,
    'pickup_phone': String,
    'pickup_email': String,
    'order_status': String,
    'api_key': String,
    'created_on' : {type: Date, default: Date.now},
	'last_updated' : {type: Date}
});

module.exports = mongoose.model('FoodOrder', FoodOrderSchema);