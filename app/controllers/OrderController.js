const Customer = require('../models/CustomersModel');
const Restaurant = require('../models/RestaurantModel');
const User = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');

const config = require('../../config');
const uuid = require('node-uuid');
const crypto = require('crypto');

const MenuModel = require('../models/MenuModel');
const OrderModel = require('../models/OrderModel');
const RestaurantModel = require('../models/RestaurantModel');

module.exports = {

    placeOrder: async function(req, res) {

        if(!req.body.quantity) return res.status(400).json({status: 400, message: "quantity required."});
        if(!req.body.item_id) return res.status(400).json({status: 400, message: "item_id required."});
        if(!req.body.customer_phone) return res.status(400).json({status: 400, message: "customer_phone required."});
        if(!req.body.delivery_address) return res.status(400).json({status: 400, message: "delivery_address required."});
        if(!req.body.restaurant_id) return res.status(400).json({status: 400, message: "restaurant_id required."});
        if(!req.body.delivery_agent) return res.status(400).json({status: 400, message: "delivery_agent required."});

        try {
            let item = await MenuModel.findOne({_id: req.body.item_id}).exec();
            if(!item) return res.status(404).json({status: 404, message: 'Item not found.'});

            let restaurant = await RestaurantModel.findOne({_id: req.body.restaurant_id}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});

            let new_order = new OrderModel();

            new_order.quantity = req.body.quantity;
            new_order.item_id = req.body.item_id;
            new_order.customer_phone = req.body.customer_phone;
            new_order.delivery_address = req.body.delivery_address;
            new_order.restaurant_id = req.body.restaurant_id;
            new_order.delivery_agent = req.body.delivery_agent;
            new_order.order_cost = req.body.quantity * item.price;

            await new_order.save();

            //send payment and whatsapp link.

            return res.status(200).json({status: 200, message: 'Order created.', payment_link: "", whatsapp_link: restaurant.whatsapp_link});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
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