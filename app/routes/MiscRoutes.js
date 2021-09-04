var express = require('express');
var router = express.Router();
var MiscController = require('../controllers/MiscController');
var multer = require('multer');
var upload = multer({dest: 'uploads/'}); //for handling multipart form data.

router.delete('/delete_restaurant', MiscController.deleteRestaurantByEmail);

router.route('/')
    .post(upload.single('image'), MiscController.uploadFileToS3);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;