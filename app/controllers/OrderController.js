const axios = require("axios");

const Customer = require('../models/CustomersModel');
const Restaurant = require('../models/RestaurantModel');
const User = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');
const PaystackLogModel = require("../models/PaystackLogModel");

const config = require('../../config');
const uuid = require('node-uuid');
const crypto = require('crypto');

const MenuModel = require('../models/MenuModel');
const OrderModel = require('../models/OrderModel');
const RestaurantModel = require('../models/RestaurantModel');

const { deliveryGeolocationData, pickupGeolocationData } = require('../utils/geolocation');


module.exports = {

    placeOrder: async function(req, res) {

        if(!req.body.quantity) return res.status(400).json({status: 400, message: "quantity required."});
        if(!req.body.item_id) return res.status(400).json({status: 400, message: "item_id required."});
        if(!req.body.customer_phone) return res.status(400).json({status: 400, message: "customer_phone required."});
        if(!req.body.delivery_address) return res.status(400).json({status: 400, message: "delivery_address required."});
        if(!req.body.pickup_address) return res.status(400).json({status: 400, message: "pickup_address required."});
        if(!req.body.pickup_name) return res.status(400).json({status: 400, message: "pickup_name required."});
        if(!req.body.pickup_phone) return res.status(400).json({status: 400, message: "pickup_phone required."});
        if(!req.body.pickup_email) return res.status(400).json({status: 400, message: "pickup_email required."});
        if(!req.body.delivery_name) return res.status(400).json({status: 400, message: "delivery_name required."});
        if(!req.body.delivery_phone) return res.status(400).json({status: 400, message: "delivery_phone required."});
        if(!req.body.delivery_email) return res.status(400).json({status: 400, message: "delivery_email required."});
        if(!req.body.restaurant_id) return res.status(400).json({status: 400, message: "restaurant_id required."});
        if(!req.body.delivery_agent) return res.status(400).json({status: 400, message: "delivery_agent required."});

        try {
            let item = await MenuModel.findOne({_id: req.body.item_id}).exec();
            if(!item) return res.status(404).json({status: 404, message: 'Item not found.'});

            let restaurant = await RestaurantModel.findOne({_id: req.body.restaurant_id}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});


            // converts latitude and longitude to formatted address
            await deliveryGeolocationData(req.body.delivery_address, req, res);

            await pickupGeolocationData(req.body.pickup_address, req, res);



            let new_order = new OrderModel();


            new_order.order_status = "PENDING";
            new_order.quantity = req.body.quantity;
            new_order.item_id = req.body.item_id;
            new_order.customer_phone = req.body.customer_phone;
            new_order.delivery_address = req.body.delivery_address;
            new_order.pickup_address = req.body.delivery_address;
            new_order.delivery_name = req.body.delivery_name;
            new_order.delivery_phone = req.body.delivery_phone;
            new_order.delivery_email = req.body.delivery_email;
            new_order.pickup_name = req.body.pickup_name;
            new_order.pickup_phone = req.body.pickup_phone;
            new_order.pickup_email = req.body.pickup_email;
            new_order.restaurant_id = req.body.restaurant_id;
            new_order.delivery_agent = req.body.delivery_agent;
            new_order.order_cost = req.body.quantity * item.price;
            new_order.order_status = "PENDING";


            let _order = await new_order.save();

            let txn_journal = new TransactionJournal();
            var ref = uuid.v4();

            txn_journal.txnref = ref;
            txn_journal.amount = req.body.quantity * item.price;
            txn_journal.title = "Food Order";
            txn_journal.customer = req.body.customer_phone;
            txn_journal.order = _order._id;


            await txn_journal.save();

            //send payment and whatsapp link.

            return res.status(200).json({status: 200, message: 'Order created.', payment_ref: txnref, whatsapp_link: restaurant.whatsapp_link});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    confirmAndLogPayEvents: async function(req, res) {

        var hash = crypto.createHmac('sha512', config.paystack_sk).update(JSON.stringify(req.body)).digest('hex');

	    if (hash == req.headers['x-paystack-signature']) {

	        var event = req.body;
	        var eventlog = new PaystackLogModel();
	        eventlog.log = event;

	        eventlog.save(function(err) {
                if (err) console.log(err);
            });

            try {

                let txn = await TransactionJournal.findOne({ txnref: event.data.reference, success: false }).exec();
                if(!txn) console.log("Unable to find transaction with that ref: ", event.data.reference);

                if(event.data.status === "success") {
                    let order = OrderModel.findOne({_id: txn.order});
                    if(!order) console.log("#UNABLE TO FIND ORDER WITH ORDER _ID");

                    order.order_status = "CONFIRMED";
                    await order.save();
                    
                    console.log("successful");                    
                }

            } catch (error) {
                console.log("#ERROR PROCESSING REQUESTS: ", error.message);
            }
	    } else {
            console.log("hashes don't match.");
        }

        return res.status(200).json(200);
    },

    listOrders: async function(req, res) {
        try {
            let items = await OrderModel.find({customer_phone: req.params.customer_phone}).populate("restaurant_id").populate("item_id").exec();

            return res.status(200).json({status: 200, data: items});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },
}