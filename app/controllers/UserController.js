const Customer = require('../models/CustomersModel');
const RestaurantModel = require('../models/RestaurantModel');
const UserModel = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');
const MenuModel = require('../models/MenuModel');
const PreSignUpModel = require("../models/PreSignUpModel");
let mailer = require("../utils/mailer");

const fs = require("fs");
const util = require("util");
const unLinkFile = util.promisify(fs.unlink);

const config = require('../../config');
const uuid = require('node-uuid');
const messenger = require('../utils/messenger');
const AWS = require('aws-sdk');

var imageId = function () {
    return Math.random().toString(36).substr(2, 10);
};

var s3 = new AWS.S3({
    accessKeyId: config.aws_s3.ACCESS_KEY_ID,
    secretAccessKey: config.aws_s3.SECRET_ACCESS_KEY,
    Bucket: config.aws_s3.BUCKET_NAME,
    apiVersion: '2006-03-01',
    region: config.aws_s3.region,
    ACL : "public-read",
    grantee : "Everyone"
});

module.exports = {

    preSignUp: async function(req, res) {
        if(!req.body.email) {
            return res.status(400).json({status: 400, message: "Email address is required."});
        }
        
        try {
            let existing_restaurant = await PreSignUpModel.findOne({email: req.body.email}).exec();
            if(existing_restaurant) return res.status(409).json({status: 409, message: 'Email already registered.'});

            let new_restaurant = new PreSignUpModel({
                email: req.body.email,
                created_on: new Date()
            });

            await new_restaurant.save();

            return res.status(200).json({status: 200, message: "Account created!"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    getPreSignUps: async function(req, res) {
        try {

            let restaurants = await PreSignUpModel.find({}).exec();
            return res.status(200).json({data: restaurants, status: 200});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

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

            var profile_id = req.body.business_name.toLowerCase().replace(/ /g, '') + "_" + uuid.v4(), verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();;

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
                'email': req.body.email,
                'role': "RESTAURANT",
                'verification_code' : verification_code,
            });

            await new_user.save();

            mailer.sendSignUpVerificationMail(req.body.email, verification_code);
            
            //messenger.sendVonageSms(req.body.phone.replace("0", "234"), text);

            return res.status(200).json({message: "Account created!"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    listRestaurants: async function(req, res) {
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

    toggleAvailability: async function(req, res) {
        try {
            let restaurant = await RestaurantModel.findOne({phone: req.verified.phone}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});

            if(!["online", "offline"].includes(req.body.status)) return res.status(400).json({message: "Acceptable values are 'online' or 'offline'"});
            if(restaurant.is_live === req.body.status) return res.status(400).json({message: "User is already " + restaurant.is_live + "."});

            restaurant["is_live"] = req.body.status;
            await restaurant.save();

            return res.status(200).json({message: "Availability updated."});

        } catch (error) {
            return res.status(500).json({ message: error.message, status: 500 });
        }
    },

    listLiveRestaurants: async function(req, res) {
        try {
            let online_restaurants = await RestaurantModel.find({is_live: "online"}).exec();
            return res.status(200).json({data: online_restaurants, status: 200});

        } catch (error) {
            return res.status(500).json({ message: error.message, status: 500 });
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

    updateRestaurant: async function(req, res) {
        try {
            let restaurant = await RestaurantModel.findOne({phone: req.verified.phone}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});

            let user = await UserModel.findOne({phone: restaurant.phone}).exec();

            var profile_id = req.body.business_name.replace(/ /g, '') + "_" + uuid.v4();

            restaurant.email = req.body.email ? req.body.email : restaurant.email;
            restaurant.business_name = req.body.business_name ? req.body.business_name : restaurant.business_name;
            restaurant.first_name = req.body.first_name ? req.body.first_name : restaurant.first_name;
            restaurant.last_name = req.body.last_name ? req.body.last_name : restaurant.last_name;
            restaurant.address = req.body.address ? req.body.address : restaurant.address;
            restaurant.phone = req.body.phone ? req.body.phone.replace("0", "234") : restaurant.phone;
            restaurant.streameats_id = profile_id;
            restaurant.streameats_link = config.base_url + "/" + profile_id;
            restaurant.whatsapp_link = "https://web.whatsapp.com/send?phone=" + req.body.phone.replace("0", "234");

            await restaurant.save();

            user.phone = req.body.phone ? req.body.phone.replace("0", "234") : user.phone;

            await user.save();

            return res.status(200).json({message: "Account updated!"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    getRestaurant: async function(req, res) {
        try {
            let restaurant = await RestaurantModel.findOne({phone: req.verified.phone}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});

            let menus = await MenuModel.find({restaurant: restaurant._id}).exec();

            return res.status(200).json({restaurant: restaurant, menus: menus});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    updateRestaurantAttachments: async function (req, res) {
        if(!req.body.image_type) return res.status(400).json({message: "Image type is required."});
        if(req.body.image_type !== "cover_image" && req.body.image_type !== "profile_image") return res.status(400).json({message: "Image type must be cover_image or profile_image."});

        try {

            let restaurant = await RestaurantModel.findOne({phone: req.verified.phone}).exec();
            if(!restaurant) return res.status(404).json({status: 404, message: 'Restaurant not found.'});

            let file_stream = fs.createReadStream(req.file.path);

            const params = {
                Bucket: config.aws_s3.BUCKET_NAME,
                Key: imageId(), //config.env + "/" + req.body.image_type + "/" + imageId() + req.file.originalname,
                Body: file_stream
            };

            s3.upload(params, async function(err, data) {
                if (err) {
                    return res.status(500).json({status: 500, message: err.message});
                }

                restaurant[req.body.image_type] = data.key;
                await restaurant.save();

                await unLinkFile(req.file.path);
                
                return res.status(200).json({message: "File uploaded successfully."});
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500
            });
        }
    },

    fetchAttachment: async function(req, res) {
        try {
            let params = {
                Bucket: config.aws_s3.BUCKET_NAME,
                Key: req.params.attachment_id
            };

            let read_stream = s3.getObject(params, function(err, data) {
                if (err) {
                    return res.status(500).json({status: 500, message: err.message});
                }
            }).createReadStream();

            return read_stream.pipe(res);

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