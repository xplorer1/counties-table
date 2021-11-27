let UserModel = require('../models/UserModel');
let messenger = require("../utils/messenger");
let mailer = require("../utils/mailer");

let config = require('../../config');
let uuid = require('node-uuid');

let jwt = require('jsonwebtoken');
let RestaurantModel = require('../models/RestaurantModel');

let AccessToken = require('twilio').jwt.AccessToken;
let VideoGrant = AccessToken.VideoGrant;

// Used when generating any kind of tokens
// To set up environmental variables, see http://twil.io/secure
let twilioAccountSid = config.twilio.ACCOUNT_SID;
let twilioApiKey = config.twilio.API_KEY;
let twilioApiSecret = config.twilio.API_SECRET;

module.exports = {

    signIn: async function(req, res) {
        if(!req.body.email) return res.status(400).json({status: 400, message: "Email required."});
        let email = req.body.email.trim();

        try {
            let user = await UserModel.findOne({email: email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            if(!user.verified) return res.status(400).json({message: "Your email is yet to be verified. Check your inbox for verification code."});
            var login_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

            user.login_code = login_code;
            user.login_codes.push(login_code);

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

        try {
            let user = await UserModel.findOne({verification_code: req.body.verification_code.trim().toUpperCase(), email: req.body.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            if(user.verified) return res.status(400).json({status: 400, message: 'Email already verified.'});

            let restaurant = await RestaurantModel.findOne({email: req.body.email}).exec();
            
            var expiry_date = new Date(user.created_on);
            expiry_date.setDate(expiry_date.getDate() + 2);

            if (expiry_date > new Date()) { //code is still valid.

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

            } else {
                var verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();
                user.verification_code = verification_code;

                await user.save();

                mailer.sendSignUpVerificationMail(user.email, verification_code);      

                return res.status(400).json({status: 400, message: 'Activation code expired. Enter the code just sent to your registered phone.'});
            }

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
    },

    /**
     * 
     * @param {verification_code} req object
     * @param {object} res object
     * @returns {object} success or error response object.
    */

    generateTwilioToken: async function(req, res) {
        let identity = req.params.customer_phone;

        // Create Video Grant
        const videoGrant = new VideoGrant();

        // Create an access token which we will sign and return to the client,
        // containing the grant we just created
        let token = new AccessToken(
            twilioAccountSid,
            twilioApiKey,
            twilioApiSecret,
            {identity: identity}
        );

        token.addGrant(videoGrant);

        // Serialize the token to a JWT string

        token = token.toJwt();

        return res.status(200).json({data: token});
    },
}