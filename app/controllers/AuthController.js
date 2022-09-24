let UserModel = require('../models/UserModel');
let mailer = require("../utils/mailer");

let config = require('../../config');
let uuid = require('node-uuid');

let jwt = require('jsonwebtoken');
let RestaurantModel = require('../models/RestaurantModel');

module.exports = {

    signIn: async function(req, res) {
        if(!req.body.email) return res.status(400).json({status: 400, message: "Email required."});
        let email = req.body.email.trim();

        try {
            let user = await UserModel.findOne({email: email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            if(!user.verified) {
                let verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

                user.verification_code = verification_code;
                await user.save();
                
                mailer.sendSignUpVerificationMail(req.body.email, verification_code);

                return res.status(400).json({message: "Your email is yet to be verified. Check your inbox for verification code."});
            }

            var login_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

            user.login_code = login_code;
            user.login_codes.push(login_code);

            console.log("login_code: ", login_code)

            await user.save();

            mailer.sendSignInMail(user.email, login_code);

            return res.status(200).json({status: 200, message: 'Login code has been sent to email address.'});

        } catch (error) {
            return res.status(500).json({status: 500, message: 'Error processing requests.', error: error.message});
        }
    },

    /**
     * 
     * @param {verification_code} req object
     * @param {object} res object
     * @returns {object} success or error response object.
    */

    verifySignUpCode: async function (req, res) {
        if(!req.body.verification_code) return res.status(400).json({status: 400, message: "Code is required."});
        if(!req.body.email) return res.status(400).json({status: 400, message: "Email is required."});

        console.log("vcode: ", req.body.verification_code);
        console.log("email: ", req.body.email);

        try {
            let user = await UserModel.findOne({verification_code: req.body.verification_code.trim().toUpperCase(), email: req.body.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            if(user.verified) return res.status(400).json({status: 400, message: 'Email already verified.'});

            let restaurant = await RestaurantModel.findOne({email: req.body.email}).exec();

            user.verified = true;
            user.verified_on = new Date();
            user.last_login = new Date();
            
            await user.save();
            restaurant.verified = true;

            await restaurant.save();

            var token = jwt.sign({phone: restaurant.phone, email: req.body.email}, config.secret, {
                expiresIn: 432000 // expires in 5 days
            });

            mailer.sendWelcomeMail(restaurant.email, restaurant.business_name, restaurant.streameats_link);

            return res.status(200).json({status: 200, data: token, message: 'Activation successful!'});

        } catch (error) {
            return res.status(500).json({status: 500 ,message: error.message});
        }
    },

    /**
     * 
     * @param {verification_code} req object
     * @param {object} res object
     * @returns {object} success or error response object.
    */

    verifySignInCode: async function(req, res) {
        if(!req.body.login_code) return res.status(400).json({status: 400, message: "Code is required."});
        if(!req.body.email) return res.status(400).json({status: 400, message: "Email is required."});

        try {
            let user = await UserModel.findOne({login_code: req.body.login_code.trim().toUpperCase(), email: req.body.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            user.login_code = null;
            user.last_login = new Date();

            user.save();

            console.log("user: ", user);

            var token = jwt.sign({phone: user.phone, email: req.body.email}, config.secret, {
                expiresIn: 432000 // expires in 5 days
            });

            return res.status(200).json({ status: 200, message: 'Login successful.', data: token});

        } catch (error) {
            return res.status(500).json({status: 500 ,message: error.message});
        }
    }
}