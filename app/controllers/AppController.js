const Customer = require('../models/CustomersModel');
const Restaurant = require('../models/RestaurantModel');
const User = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');

//const mailer = require('../../utils/mailer');
const config = require('../../config');
const uuid = require('node-uuid');
const crypto = require('crypto');

var imageId = function () {
    return Math.random().toString(36).substr(2, 4);
};

// -----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA73Ylr7kMuUclJgCI2DBY
// BpHjqiKNKUu0zJoZQo3UhH1et8+0LstuD3KtDEIVCPfpTSU/dtALPSm+l97GzlN/
// /PWBARMyx8QaCP/Zrk6BJhi7frSGm/FJ8qEg0lKoeIZKGhXWP/yIHFwiRISx4Vww
// R/BHq3G15siSGP6zebLTomH8LbbVXLFj2t1VWi7YQJQa0VvysltoRQiDEA7k1kHe
// wI1cm3trtVvuS/1AFl+hgumm3Zi0iBo3EY4DqytX4kQf9COu85kRras7sZQ1tkOE
// faF5sZC4D2TKqjsryIQ8tdxMjypk3l15KrrWvJe/0n2vXmZmc1fZC6wgRPmjYCni
// kQIDAQAB
// -----END PUBLIC KEY-----

module.exports = {

    login: async function(req, res) {
        if(!req.body.phone) return res.status(400).json({status: 400, message: "Phone required."});

        try {
            let user = await User.findOne({phone: req.body.phone.trim().toLowerCase()}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            var logincode = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

            user.logincode = logincode;
            user.logincodes.push(logincode);

            await user.save();

            return res.status(200).json({status: 200, message: 'Login code has been sent to phone number.'});

        } catch (error) {
            return res.status(500).json({status: 500, message: 'Error processing requests.', error: error.message});
        }
    },

    signUpCustomer: async function(req, res) {

    },

    signUpRestaurant: async function(req, res) {
        if(!req.body.email) {
            return res.status(400).json({message: "Email address is required."});
        }
        if(!config.validateEmail(req.body.email)) {
            return res.status(400).json({message: "Email address is not valid."});
        }
        if(!req.body.phone) {
            return res.status(400).json({message: "Phone number is required."});
        }
        if(!req.body.socialmediachannels) {
            return res.status(400).json({message: "Social media links is required."});
        }
        if(!req.body.fullname) {
            return res.status(400).json({message: "We require your first and last names."});
        }
        if(!req.body.brandname) {
            return res.status(400).json({message: "Brand name is required."});
        }
        if(!req.body.website) {
            return res.status(400).json({message: "Website is required."});
        }
        if(!req.body.password) {
            return res.status(400).json({message: "Provide a password to secure your account."});
        }

        let existinguser;

        try {
            existinguser = await User.findOne({$or : [{email: req.body.email}, {phone: req.body.phone}]}).exec();
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }

        if(existinguser) return res.status(409).json({message: 'Account exists.'});

        var verificationid = uuid.v4();

        var user = new User({
            email : req.body.email,
            role: "BRAND",
            verified : false,
            verificationid: verificationid,
            password: req.body.password
        });

        user.save(function (err, saved) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating brand.',
                    error: err
                });
            }

            var brand = new Restaurant({
                fullname : req.body.fullname,
                brandname : req.body.brandname,
                phone : req.body.phone,
                email : req.body.email,
                socialmediachannels: req.body.socialmediachannels,
                website: req.body.website,
                role: "BRAND",
                parent: saved._id,
                verified: false,
            });

            brand.save(function(err, child) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating brand.',
                        error: err
                    });
                }

                    //mailer.sendEmailVerificationMail(req.body.fullname, config.baseurl + '/emailVerification/' + verificationid, req.body.email);
            
                return res.status(200).json({message: "Account has been created."});
            })
        });
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
        if(!req.body.phonenumber) return res.status(400).json({message: "Phone number required."});
        if(!req.body.email) return res.status(400).json({message: "Email address is required."});
        if(!config.validateEmail(req.body.email)) return res.status(400).json({message: "Email address is not valid."});
        if(!req.body.subject) return res.status(400).json({message: "Subject is required."});
        if(!req.body.message) return res.status(400).json({message: "Message is required."});

        var support = new TransactionJournal({
            phonenumber : req.body.phonenumber,
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
                phonenumber: req.body.phonenumber,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message
            }

            //mailer.sendSupportMail(obj, config.supportmail);

            return res.status(200).json({message: "Support created!"});
        });
    }
}