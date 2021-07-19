var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/AuthController');

router.post('/sign_in', AuthController.signIn);

router.post('/verify_sign_up', AuthController.verifySignUpCode);

router.post('/verify_sign_in', AuthController.verifySignInCode);

router.post('/generate_token/:customer_phone', AuthController.generateTwilioToken);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;