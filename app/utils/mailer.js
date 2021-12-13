let sgMail = require('@sendgrid/mail');
let config = require('../../config');
let path = require("path");

let general_sender = 'hello@streameats.com.ng';
let general_utils = require('./general_utils');
let handlebars = require('handlebars');
let fs = require('fs');

sgMail.setApiKey(config.send_grid.api_key);

module.exports = {
    sendSignInMail: async function(recipient, login_code) {
        try {
    
            var html_template = '/mail_templates/sign_in.html';

            fs.readFile(path.join(__dirname + html_template), {encoding: 'utf-8'}, async function (err, html) {
                if (err) return console.log(err);

                var template = handlebars.compile(html);
                var variables = {
                    logo: 'https://streameats.com.ng/logo.svg',
                    login_code: login_code,

                    facebook: "https://feedonomics.com/wp-content/uploads/2018/05/facebook-logo-full-transparent.png",
                    instagram: "https://statesborodowntown.com/wp-content/uploads/2016/01/instagram-Logo-PNG-Transparent-Background-download.png",
                    twitter: "https://clipartcraft.com/images/twitter-transparent-logo-social-media.png"
                };
        
                var ready_html = template(variables);

                let msg = {
                    to: recipient, // Change to your recipient
                    from:  'Stream Eats <' + general_sender + '>', // Change to your verified sender
                    subject: 'Sign In Code',
                    text: "Hello! Someone recently tried to login with your phone number. If this was you, enter this code below into your login form: " + login_code + " to proceed.",
                    html: ready_html,
                };
        
                let msx = await sgMail.send(msg);

                console.log("mxs: ", msx);
                    
            });
            
        } catch (error) {
            console.log('error: ', error);
            return {status: false, error: error.message};
        }
    },

    sendSignUpVerificationMail: async function(recipient, verification_code) {
        try {
    
            var html_template = '/mail_templates/sign_up_verification.html';

            fs.readFile(path.join(__dirname + html_template), {encoding: 'utf-8'}, async function (err, html) {
                if (err) return console.log(err);

                var template = handlebars.compile(html);
                var variables = {
                    logo: 'https://streameats.com.ng/logo.svg',
                    verification_code: verification_code,

                    facebook: "https://feedonomics.com/wp-content/uploads/2018/05/facebook-logo-full-transparent.png",
                    instagram: "https://statesborodowntown.com/wp-content/uploads/2016/01/instagram-Logo-PNG-Transparent-Background-download.png",
                    twitter: "https://clipartcraft.com/images/twitter-transparent-logo-social-media.png"
                };
        
                var ready_html = template(variables);

                let msg = {
                    to: recipient, // Change to your recipient
                    from:  'Stream Eats <' + general_sender + '>', // Change to your verified sender
                    subject: 'Sign Up Code',
                    text: "Hello! Welcome to Stream Eats and thank you for signing up. To activate your account please verify your email address by typing this verification code into your sign up form: " + verification_code + ". All future notifications will be sent to this email address. Thank you for choosing Stream Eats! The Stream Eats Team. www.streameats.com.ng",
                    html: ready_html,
                };
        
                await sgMail.send(msg);
                    
            });
            
        } catch (error) {
            console.log('error: ', error);
            return {status: false, error: error.message};
        }
    },

    sendWelcomeMail: async function(recipient, name, stream_link) {
        try {
    
            var html_template = '/mail_templates/welcome.html';

            fs.readFile(path.join(__dirname + html_template), {encoding: 'utf-8'}, async function (err, html) {
                if (err) return console.log(err);

                var template = handlebars.compile(html);
                var variables = {
                    logo: 'https://streameats.com.ng/logo.svg',
                    stream_link: stream_link,
                    name: name,
                    facebook: "https://feedonomics.com/wp-content/uploads/2018/05/facebook-logo-full-transparent.png",
                    instagram: "https://statesborodowntown.com/wp-content/uploads/2016/01/instagram-Logo-PNG-Transparent-Background-download.png",
                    twitter: "https://clipartcraft.com/images/twitter-transparent-logo-social-media.png"
                };
        
                var ready_html = template(variables);

                let msg = {
                    to: recipient, // Change to your recipient
                    from:  'Stream Eats <' + general_sender + '>', // Change to your verified sender
                    subject: 'You are welcome!',
                    text: "Thank you for signing up for Stream Eats - we're delighted to have you onboard!" +
                        "We started Stream Eats with a goal of helping culinary entrepreneurs expand their reach while creating a space of edible confidence through livestreaming. Today we are willing to give you those tools to achieve only dreamable goals." +
                        "You have access to a our team willing to put your needs first. Connect with a Customer Success Expert, who'll be your personal guide.",
                    html: ready_html,
                };
        
                await sgMail.send(msg);
                    
            });
            
        } catch (error) {
            console.log('error: ', error);
            return {status: false, error: error.message};
        }
    }
}