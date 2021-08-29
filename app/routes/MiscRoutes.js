var express = require('express');
var router = express.Router();
var MiscController = require('../controllers/MiscController');

router.delete('/delete_restaurant', MiscController.deleteRestaurantByEmail);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;