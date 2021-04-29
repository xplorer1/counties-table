var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');

var middlewares = require("../utils/middleware.js");

//router.post('/customer', AppController.signUpCustomer);

router.route('/restaurant')
    .post(UserController.signUpRestaurant)
    .get(UserController.getRestaurants)

router.get('/restaurant/:streameats_id', UserController.getRestaurantByStreamEatsId);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

module.exports = router;