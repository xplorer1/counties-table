var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/AuthController');

router.post('/sign_in', AuthController.login);

router.post('/nexmo/inbound', AuthController.confirmInboundNexmoMessage);

router.post('/nexmo/status', AuthController.confirmNexmoMessageStatus); 

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;