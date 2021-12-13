const config = require('../../config');
const Vonage = require('@vonage/server-sdk');

const vonage = new Vonage({
    apiKey: config.nexmo.VONAGE_API_KEY,
    apiSecret: config.nexmo.VONAGE_API_SECRET 
});

module.exports = {
    sendVonageSms: function sendVonageSms(recipient, text) {
        vonage.message.sendSms(config.nexmo.SMS_SENDER, recipient, text, (err, response_data) => {
        
            if (err) {
                console.log(err);
            } else {
                if(response_data.messages[0]['status'] === "0") {
                    console.log("Message sent successfully.");
                } else {
                    console.log(`Message failed with error: ${response_data.messages[0]['error-text']}`);
                }
            }
        });
    }
};