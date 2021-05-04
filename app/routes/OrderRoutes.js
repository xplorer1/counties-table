var express = require('express');
var router = express.Router();
var OrderController = require('../controllers/OrderController');

var middlewares = require("../utils/middleware.js");

router.route('/')
    .post(OrderController.placeOrder)

router.get("/:customer_phone", OrderController.listOrders);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;