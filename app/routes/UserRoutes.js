var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');

var middlewares = require("../utils/middleware.js");
const multer = require('multer');
const upload = multer({dest: 'uploads/'}); //for handling multipart form data.

router.route('/')
    .post(UserController.signUpRestaurant)
    .get(middlewares.checkToken, UserController.getRestaurant)
    .put(middlewares.checkToken, UserController.updateRestaurant);

router.route('/pre_sign_up')
    .post(UserController.preSignUp)
    .get(UserController.getPreSignUps);

router.post('/attachments', middlewares.checkToken, upload.single('image'), UserController.updateRestaurantAttachments);
router.get('/attachments/:attachment_id', UserController.fetchAttachment);

router.route('/availability')
    .post(middlewares.checkToken, UserController.toggleAvailability)
    .get(UserController.listLiveRestaurants);

router.route('/visibility_status')
    .post(middlewares.checkToken, UserController.toggleVisibilityStatus);
    
router.get('/restaurants', UserController.listRestaurants);

router.get('/restaurant/:streameats_id', UserController.getRestaurantByStreamEatsId);

module.exports = router;