const MenuModel = require('../models/MenuModel');
const OrderModel = require('../models/OrderModel');
const RestaurantModel = require('../models/RestaurantModel');
const { deliveryGeolocationData, pickupGeolocationData } = require('../utils/geolocation');
const axios = require("axios");
const TransactionJournal = require('../models/TransactionJournal');
let uuid = require("node-uuid");

exports.handleDelivery = async(body) => {
    
    try {
        
        let item = await MenuModel.findOne({_id: body.item_id}).exec();
        if(!item) return {status: false, message: 'Item not found.'};

        let restaurant = await RestaurantModel.findOne({_id: body.restaurant_id}).exec();
        if(!restaurant) return {status: false, message: 'Restaurant not found.'};

        // converts latitude and longitude to formatted address
    
        let pickupAddress;
        let result = true;
        await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
            params: {
                address: body.pickup_address,
                key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
            },
            })
            .then(function (response) {
                console.log("error message# ", response.data.error_message);

                if(response.data.results.length == 0 ) result = false;
                else {
                    pickupAddress = response.data.results[0].geometry.location;
                    console.log(pickupAddress)
                }
            })

        let deliveryAddress;
        await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
            params: {
                address: body.delivery_address,
                key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
            },
            })
            .then(function (response) {
                console.log("error message# ", response.data.error_message);
                
                if(response.data.results.length == 0 ) result = false;
                else {
                    deliveryAddress = response.data.results[0].geometry.location;
                    console.log(deliveryAddress)
                }
            })

            if(!result) return {status: false, message: "There is an error with the google APIs. Contact system admin."};

            let new_order = new OrderModel();

            new_order.order_status = "PENDING";
            new_order.quantity = body.quantity;
            new_order.item_id = body.item_id;
            new_order.customer_phone = body.customer_phone;
            new_order.delivery_address = body.delivery_address;
            new_order.delivery_latitude = deliveryAddress.lat;
            new_order.delivery_longitude = deliveryAddress.lng;
            new_order.pickup_address = body.pickup_address;
            new_order.pickup_latitude = pickupAddress.lat;
            new_order.pickup_longitude = pickupAddress.lng;
            new_order.delivery_name = body.delivery_name;
            new_order.delivery_phone = body.delivery_phone;
            new_order.delivery_email = body.delivery_email;
            new_order.pickup_name = body.pickup_name;
            new_order.pickup_phone = body.pickup_phone;
            new_order.pickup_email = body.pickup_email;
            new_order.restaurant_id = body.restaurant_id;
            new_order.delivery_agent = body.delivery_agent;
            new_order.order_cost = body.quantity * item.price;
            new_order.order_status = "PENDING";
            new_order.api_key = "Jr9MmFzbycOYZdgMhR5al3PXvf9U5tUaoIWgJCqpi7EAiN4BTrAMLBpqxkmo";

            let _order = await new_order.save();

            var request = require('request');

            request({
                method: 'POST',
                url: 'https://api.gokada.ng/api/developer/order_create',
                headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(_order)
            }, function (error, response, body) {
                console.log('Status:', response.statusCode);
                console.log('Response:', body);
            });

            let txn_journal = new TransactionJournal();
            var ref = uuid.v4();

            txn_journal.txnref = ref;
            txn_journal.amount = body.quantity * item.price;
            txn_journal.title = "Food Order";
            txn_journal.customer = body.customer_phone;
            txn_journal.order = _order._id;

            await txn_journal.save();

            //send payment and whatsapp link.
            let return_data = {
                payment_ref: ref, 
                whatsapp_link: restaurant.whatsapp_link
            };

            return {status: true, message: 'Order created.', data: return_data};

    } catch (error) {
        return {status: false, message: error.message};
    }
}

exports.handleNonDelivery = async(body) => {

    try {

        let item = await MenuModel.findOne({_id: body.item_id}).exec();
        if(!item) return {status: false, message: 'Item not found.'};

        let restaurant = await RestaurantModel.findOne({_id: body.restaurant_id}).exec();
        if(!restaurant) return {status: false, message: 'Restaurant not found.'};

        let new_order = new OrderModel();

        new_order.order_status = "PENDING";
        new_order.quantity = body.quantity;
        new_order.item_id = body.item_id;
        new_order.customer_phone = body.customer_phone;
        new_order.restaurant_id = body.restaurant_id;
        new_order.order_cost = body.quantity * item.price;
        new_order.order_status = "PENDING";

        let _order = await new_order.save();

        let txn_journal = new TransactionJournal();
        let ref = uuid.v4();

        txn_journal.txnref = ref;
        txn_journal.amount = body.quantity * item.price;
        txn_journal.title = "Food Order";
        txn_journal.customer = body.customer_phone;
        txn_journal.order = _order._id;

        await txn_journal.save();

        //send payment and whatsapp link.
        let return_data = {
            payment_ref: ref, 
            whatsapp_link: restaurant.whatsapp_link
        };

        return {status: true, message: 'Order created.', data: return_data};
        
    } catch (error) {
        return {status: false, message: error.message};
    }
    
}