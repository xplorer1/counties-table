var express = require('express');
var router = express.Router();
var AppController = require('../controllers/AppController');

var middlewares = require("../utils/middleware.js");

router.post('/auth/sign_in', AppController.login);

router.post('/customer', AppController.signUpCustomer);

router.post('/restaurant', AppController.signUpRestaurant);

router.post('/nexmo/inbound', AppController.confirmInboundNexmoMessage);

router.post('/nexmo/status', AppController.confirmNexmoMessageStatus); 

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

module.exports = router;