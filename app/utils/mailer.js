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
                    logo: global.URI + 'https://streameats.com.ng/logo.svg',
                    login_code: login_code
                };
        
                var ready_html = template(variables);

                let msg = {
                    to: recipient, // Change to your recipient
                    from:  '"Stream Eats" <' + general_sender + '>', // Change to your verified sender
                    subject: 'Sign In Code',
                    text: "Hello! Someone recently tried to login with your phone number. If this was you, enter this code below into your login form: " + login_code + " to proceed.",
                    html: ready_html,
                };
        
                let result = await sgMail.send(msg);
                    
                });
            
        } catch (error) {
            console.log('error: ', error);
            return {status: false, error: error.message};
        }
    }
}