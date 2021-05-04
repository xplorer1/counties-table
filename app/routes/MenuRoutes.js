var express = require('express');
var router = express.Router();
var MenuController = require('../controllers/MenuController');

var middlewares = require("../utils/middleware.js");
const multer = require('multer');
const upload = multer({dest: 'uploads/'}); //for handling multipart form data.

router.route('/')
    .post(middlewares.checkToken, upload.single('image'), MenuController.createMenuItem)

router.get("/:restaurant", MenuController.listMenuItems)

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;