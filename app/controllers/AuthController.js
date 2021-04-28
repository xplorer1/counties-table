const Customer = require('../models/CustomersModel');
const Restaurant = require('../models/RestaurantModel');
const User = require('../models/UserModel');
const TransactionJournal = require('../models/TransactionJournal');

//const mailer = require('../../utils/mailer');
const config = require('../../config');
const uuid = require('node-uuid');
const crypto = require('crypto');
const Vonage = require('@vonage/server-sdk');

// -----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA73Ylr7kMuUclJgCI2DBY
// BpHjqiKNKUu0zJoZQo3UhH1et8+0LstuD3KtDEIVCPfpTSU/dtALPSm+l97GzlN/
// /PWBARMyx8QaCP/Zrk6BJhi7frSGm/FJ8qEg0lKoeIZKGhXWP/yIHFwiRISx4Vww
// R/BHq3G15siSGP6zebLTomH8LbbVXLFj2t1VWi7YQJQa0VvysltoRQiDEA7k1kHe
// wI1cm3trtVvuS/1AFl+hgumm3Zi0iBo3EY4DqytX4kQf9COu85kRras7sZQ1tkOE
// faF5sZC4D2TKqjsryIQ8tdxMjypk3l15KrrWvJe/0n2vXmZmc1fZC6wgRPmjYCni
// kQIDAQAB
// -----END PUBLIC KEY-----

// const vonage = new Vonage({
//     apiKey: config.nexmo.VONAGE_API_KEY,
//     apiSecret: config.nexmo.VONAGE_API_SECRET,
//     applicationId: config.nexmo.VONAGE_APPLICATION_ID,
//     privateKey: config.nexmo.VONAGE_APPLICATION_PRIVATE_KEY_PATH
//   }, {
//     apiHost: config.nexmo.BASE_URL
//   })
  
// vonage.channel.send(
//     { "type": "whatsapp", "number": TO_NUMBER },
//     { "type": "whatsapp", "number": WHATSAPP_NUMBER },
//     {
//       "content": {
//         "type": "text",
//         "text": "This is a WhatsApp Message text message sent using the Messages API"
//       }
//     },
//     (err, data) => {
//       if (err) {
//         console.error(err);
//     } else {
//         console.log(data.message_uuid);
//         }
//     }
// );

const vonage = new Vonage({
    apiKey: config.nexmo.VONAGE_API_KEY,
    apiSecret: config.nexmo.VONAGE_API_SECRET 
});

const from = "Vonage APIs"
const to = "2348103350884"
const text = 'A text message sent using the Vonage SMS API'

vonage.message.sendSms(from, to, text, (err, responseData) => {
    console.log("responseData: ", responseData);

    if (err) {
        console.log(err);
    } else {
        if(responseData.messages[0]['status'] === "0") {
            console.log("Message sent successfully.");
        } else {
            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
    }
})

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

    confirmInboundNexmoMessage: async function(req, res) {
        console.log("res: ", req.body);
        return res.send(200);
    },

    confirmNexmoMessageStatus: async function(req, res) {
        console.log("res: ", req.body);
        return res.send(200);
    },
}