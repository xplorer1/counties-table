const Customer = require('../models/CustomersModel');
const Restaurant = require('../models/RestaurantModel');
const UserModel = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');
const messenger = require("../utils/messenger");

const config = require('../../config');
const uuid = require('node-uuid');

let jwt = require('jsonwebtoken');
const RestaurantModel = require('../models/RestaurantModel');

module.exports = {

    signIn: async function(req, res) {
        if(!req.body.phone) return res.status(400).json({status: 400, message: "Phone required."});

        let phone = req.body.phone.trim().replace("0", "234");

        try {
            let user = await UserModel.findOne({phone: phone}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            if(!user.verified) return res.status(400).json({message: "Your phone is yet to be verified. Check your inbox for verification code."});

            var login_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

            user.login_code = login_code;
            user.login_codes.push(login_code);

            await user.save();

            let text = "Hello! Someone recently tried to login with your phone number. If this was you, enter this code below into your login form: " + login_code + " to proceed.";
            messenger.sendVonageSms(user.phone, text);

            return res.status(200).json({status: 200, message: 'Login code has been sent to phone number.'});

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
        if(!req.body.phone) return res.status(400).json({status: 400, message: "Phone is required."});

        try {
            let user = await UserModel.findOne({verification_code: req.body.verification_code.trim().toUpperCase(), phone: req.body.phone.replace("0", "234")}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            if(user.verified) return res.status(400).json({status: 400, message: 'Phone already verified.'});

            let restaurant = await RestaurantModel.findOne({phone: req.body.phone.replace("0", "234")}).exec();
            
            var expiry_date = new Date(user.created_on);
            expiry_date.setDate(expiry_date.getDate() + 2);

            if (expiry_date > new Date()) { //code is still valid.

                user.verified = true;
                user.verified_on = new Date();
                user.last_login = new Date();
                
                await user.save();

                restaurant.verified = true;

                await restaurant.save();

                var token = jwt.sign({phone: req.body.phone}, config.secret, {
                    expiresIn: 432000 // expires in 5 days
                });

                return res.status(200).json({status: 200, data: token, message: 'Activation successful!'});

            } else {
                var verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

                user.verification_code = verification_code;

                await user.save();

                let text = "To activate your account please verify your phone number by typing this verification code into your sign up form " + verification_code;        
                messenger.sendVonageSms(user.phone, text);

                return res.status(400).json({status: 400, message: 'Activation code expired. Enter the code just sent to your registered phone.'});
            }

        } catch (error) {
            return res.status(500).json({status: 500 ,message: error.message});
        }
    },

    verifySignInCode: async function(req, res) {
        if(!req.body.login_code) return res.status(400).json({status: 400, message: "Code is required."});
        if(!req.body.phone) return res.status(400).json({status: 400, message: "Phone is required."});

        try {
            let user = await UserModel.findOne({login_code: req.body.login_code.trim().toUpperCase(), phone: req.body.phone.replace("0", "234")}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            user.login_code = null;
            user.last_login = new Date();

            user.save();

            var token = jwt.sign({phone: req.body.phone.replace("0", "234")}, config.secret, {
                expiresIn: 432000 // expires in 5 days
            });

            return res.status(200).json({ status: 200, message: 'Login successful.', data: token});

        } catch (error) {
            
        }
    },

    confirmInboundNexmoMessage: async function(req, res) {
        console.log("res: ", req.body);
        return res.send(200);
    },

    confirmNexmoMessageStatus: async function(req, res) {
        console.log("res: ", req.body);
        return res.send(200);
    },
}