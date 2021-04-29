var express = require('express');
var router = express.Router();
var OrderController = require('../controllers/OrderControler');

var middlewares = require("../utils/middleware.js");

router.post('/auth/sign_in', OrderController.login);

router.post('/customer', OrderController.signUpCustomer);

router.post('/restaurant', OrderController.signUpRestaurant);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

module.exports = router;