const Customer = require('../models/CustomersModel');
const RestaurantModel = require('../models/RestaurantModel');
const UserModel = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');

const config = require('../../config');
const uuid = require('node-uuid');
const messenger = require('../utils/messenger');

var imageId = function () {
    return Math.random().toString(36).substr(2, 4);
};

module.exports = {

    signUpRestaurant: async function(req, res) {
        if(!req.body.email) {
            return res.status(400).json({status: 400, message: "Email address is required."});
        }
        if(!config.validateEmail(req.body.email)) {
            return res.status(400).json({status: 400, message: "Email address is not valid."});
        }
        if(!req.body.phone) {
            return res.status(400).json({status: 400, message: "Phone number is required."});
        }
        if(req.body.phone.length !== 11) {
            return res.status(400).json({status: 400, message: "Phone number must be 11 digits."});
        }
        if(!req.body.business_name) {
            return res.status(400).json({status: 400, message: "Business name is required."});
        }
        if(!req.body.first_name) {
            return res.status(400).json({status: 400, message: "We require your first and last names."});
        }
        if(!req.body.last_name) {
            return res.status(400).json({status: 400, message: "We require your first and last names."});
        }
        if(!req.body.address) {
            return res.status(400).json({status: 400, message: "Business address is required."});
        }

        try {
            let existing_restaurant = await RestaurantModel.findOne({$or : [{email: req.body.email}, {phone: req.body.phone}]}).exec();

            if(existing_restaurant) return res.status(409).json({status: 409, message: 'Email or phone number already registered.'});

            var profile_id = req.body.business_name.replace(/ /g, '') + "_" + uuid.v4(), verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();;

            var new_restaurant = new RestaurantModel({
                'email' : req.body.email,
                'business_name': req.body.business_name,
                'first_name': req.body.first_name,
                'last_name': req.body.last_name,
                'address': req.body.address,
                'phone': req.body.phone.replace("0", "234"),
                'streameats_id': profile_id,
                'whatsapp_link': "https://web.whatsapp.com/send?phone=" + req.body.phone.replace("0", "234"),
                'streameats_link': config.base_url + "/" + profile_id,
            });

            await new_restaurant.save();

            var new_user = new UserModel({
                'phone': req.body.phone.replace("0", "234"),
                'role': "RESTAURANT",
                'verification_code' : verification_code,
            });

            await new_user.save();

            let text = "To activate your account, please verify your phone number by typing this verification code into your sign up form " + verification_code;
            messenger.sendVonageSms(req.body.phone.replace("0", "234"), text);

            return res.status(200).json({message: "Account created!"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    getRestaurants: async function(req, res) {
        try {
            let restaurants = await RestaurantModel.find({}).exec();
            return res.status(200).json({data: restaurants, status: 200});
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    getRestaurantByStreamEatsId: async function(req, res) {
        try {
            let restaurant = await RestaurantModel.findOne({streameats_id: req.params.streameats_id}).exec();
            if(!restaurant) return res.status(404).json({message: "Restaurant not found"});

            return res.status(200).json({data: restaurant, status: 200});
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    initiatePaystackTransaction: async function(req, res) {

        if(!req.body.amount) return res.status(400).json({data: "amount required."});
        if(!req.body.owner) return res.status(400).json({data: "Owner required."});
        if(!req.body.id) return res.status(400).json({data: "ID required."});

        try {
            let user = await MarketPlaceUserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({message: "User not found."});

            var mktptrxnjnl = new TransactionJournal();
            var ref = uuid.v4();

            mktptrxnjnl.txnref = ref;
            mktptrxnjnl.amount = req.body.amount;
            mktptrxnjnl.title = "Account Funding";

            if(req.body.owner === "BRAND") {
                mktptrxnjnl.brand = req.body.id;
            } else {
                mktptrxnjnl.influencer = req.body.id;
            }

            mktptrxnjnl.save((err, saved) => {
                
                if(err) return res.status(500).json({error: err.message, message: 'Error while processing requests.'});

                return res.status(200).json({data: ref});
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error when processing results.',
                error: error.message
            });
        }
    },

    createSupport: async function (req, res) {
        if(!req.body.phone) return res.status(400).json({message: "Phone number required."});
        if(!req.body.email) return res.status(400).json({message: "Email address is required."});
        if(!config.validateEmail(req.body.email)) return res.status(400).json({message: "Email address is not valid."});
        if(!req.body.subject) return res.status(400).json({message: "Subject is required."});
        if(!req.body.message) return res.status(400).json({message: "Message is required."});

        var support = new TransactionJournal({
            phone : req.body.phone,
            email : req.body.email,
            subject : req.body.subject,
            message : req.body.message,
        });

        support.save(function (err, Sponsor) {
            if (err) {
                console.log("err: ", err)
                res.status(500).json({
                    message: 'Error when creating support',
                    error: err
                });
            }

            let obj = {
                phone: req.body.phone,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message
            }

            //mailer.sendSupportMail(obj, config.supportmail);

            return res.status(200).json({message: "Support created!"});
        });
    }
}