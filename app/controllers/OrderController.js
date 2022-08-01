const TransactionJournal = require('../models/TransactionJournal');
const PaystackLogModel = require("../models/PaystackLogModel");

const config = require('../../config');
const crypto = require('crypto');

const OrderModel = require('../models/OrderModel');
let OrderService = require("../Services/OrderService");
const {successResponse, responseCode, errorResponse} = require("../utils/helpers");

module.exports = {

    placeOrder: async function(req, res) {

        try {
            
            if(req.query.type === "delivery") {
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
    
                let result = await OrderService.handleDelivery(req.body);
                if(!result.status) return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', result.message);
    
                return res.status(200).json({message: "Order placed successfully.", data: result.data});
    
            } else {
                if(!req.body.quantity) return res.status(400).json({status: 400, message: "quantity required."});
                if(!req.body.item_id) return res.status(400).json({status: 400, message: "item_id required."});
                if(!req.body.customer_phone) return res.status(400).json({status: 400, message: "customer_phone required."});
                if(!req.body.restaurant_id) return res.status(400).json({status: 400, message: "restaurant_id required."});
    
                let result = await OrderService.handleNonDelivery(req.body);
                if(!result.status) return errorResponse(res, responseCode.INTERNAL_SERVER_ERROR, 'Server Error', result.message);
    
                return res.status(200).json({message: "Order placed successfully.", data: result.data});
            }

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