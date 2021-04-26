let nodemailer = require('nodemailer');
let mailtemplates = require("./mailtemplates");
var config = require('../../config');

var prefix = config.baseurl === "https://adb-plus-api.herokuapp.com" || config.baseurl === "http://localhost:8050" ? "Staging: " : "";
var whatsappcontact = "https://cutt.ly/Adbasador";

let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
        user: "apikey",
        pass: "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"
    }
});

module.exports = {
    sendEmailVerificationMail: function sendEmailVerificationMail(name, confirmlink, recipient){

        let mailOptions = {
            from: '"Hello From Adbasador Plus"<noreply@adbasador.com>',
            cc: config.supportmail,
            to: recipient,
            subject: prefix + 'Welcome to Adbasador Plus',
            text: 'Hello ' + name + '! Please Thank you for choosing Adbasador Plus. click on the link below to active your email address. ',
            html: 'Hello ' + name + '!<br><br>Thank you for choosing Adbasador Plus. We are pleased to have you on board. ' +
            '<br><br>To activate your account, click or copy the link below to your browser. ' +
            '<br><br><a  target="_blank" href="' + confirmlink + '">' + confirmlink + '</a>'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendEmailVerifiedMail: function sendEmailVerifiedMail(name, recipient){

        let mailOptions = {
            from: '"Hello From Adbasador Plus"<noreply@adbasador.com>',
            to: recipient,
            cc: config.supportmail,
            subject: prefix + 'Next Steps!',
            text: 'Hello ' + name + '! . ',
            html: mailtemplates.followup
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendPasswordResetMail: function sendPasswordResetMail(name, recipient, pwdresetlink){
        
        let mailOptions = {
            from: '"Message from Adbasador Plus"<noreply@adbasador.com>',
            to: recipient,
            cc: config.supportmail,
            subject: prefix + 'Password Reset',
            text: 'Hello ' + name + '! We heard you need your password reset. Click the link below and you\'ll be redirected to a secure location from where you can set a new password. ' + pwdresetlink + '. This link is valid for only 1 hour. If you didn\'t try to reset your password, simply ignore this email.', // plaintext body
            html: 'Hello ' + name + '!<br><br>We heard you need your password reset. Click the link below and you\'ll be redirected to a secure location from where you can set a new password.<br><br><a target="_blank" href="' + pwdresetlink + '">' + pwdresetlink + '</a><br><br>This link is valid for only 1 hour. <br><br>If you didn\'t try to reset your password, simply ignore this mail, and we\'ll forget this ever happened.' // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendSupportMail: function sendSupportMail(obj, recipient){
        
        let mailOptions = {
            from: '"Message from Adbasador Plus"<noreply@adbasador.com>',
            to: recipient,
            cc: config.supportmail,
            subject: prefix + 'Support from Adbasador Plus: ' + obj.subject,
            text: 'Email: ' + obj.email + 'Phone: ' + obj.phonenumber + obj.message, // plaintext body
            html: 'Email: ' + obj.email + '<br><br> Phone: ' + obj.phonenumber +'<br><br>' + obj.message // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendSupportReceiptMail: async function sendGeneric(obj, recipient) {
        let mailOptions = {
            from: '"Message from Adbasador Plus"<noreply@adbasador.com>',
            to: recipient,
            cc: config.supportmail,
            subject: prefix + 'Hello from Adbasador Plus: ',
            text: obj.message, // plaintext body
            html: 'Hello! <br><br><b> Notification of support from ' + obj.supporter + '<br><br>' + obj.message // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendRewardMail: async function sendGeneric(obj, recipient) {
        let mailOptions = {
            from: '"Message from Adbasador Plus"<noreply@adbasador.com>',
            to: recipient,
            cc: config.supportmail,
            subject: prefix + 'Hello from Adbasador Plus: ',
            text: obj.message, // plaintext body
            html: 'Hello <br><br> ' + obj.message // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendFollowUpMail: function sendFollowUpMail(name, recipient){

        let mailOptions = {
            from: '"Hello From Adbasasor Plus"<noreply@adbasador.com>',
            to: recipient,
            subject: 'Welcome to Adbasasor Plus',
            text: 'Hello ' + name + '! Thank you for choosing Adbasasor Plus. An agent will reach out to you to inform you on everything you need to know. Or you can chat immediately with Kosi via ' + whatsappcontact,
            html: 'Hello ' + name + '!<br><br>Thank you for choosing Adbasador Plus. We are pleased to have you on board. ' +
            '<br><br>An agent will reach out to you to inform you on everything you need to know. ' +
            '<br><br>Or you can <a  target="_blank" href="' + whatsappcontact + '"> TAP HERE </a> to chat with Kosy right away!'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendBrandNotificationMail: function sendBrandNotificationMail(recipient, title, message) {

        let mailOptions = {
            from: '"Hello From Adbasador MarketPlace"<noreply@adbasador.com>',
            cc: config.supportmail,
            to: recipient,
            subject: title,
            text: message,
            html: message
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendAdminPassword: function sendAdminPassword(recipient, password) {

        let mailOptions = {
            from: '"Hello From Adbasador MarketPlace"<noreply@adbasador.com>',
            cc: config.supportmail,
            to: recipient,
            subject: "Administrator Invitation",
            text: "Hello! You have been invited to collaborate as an administrator on adbasador marketplace. Your temporary password is " + password + ". You are mandated to change it upon sign in.",
            html: "Hello! You have been invited to collaborate as an administrator on adbasador marketplace. <br>Your temporary password is <b>" + password + "</b> . You are mandated to change it upon sign in.",
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendInfluencerNotificationMail: function sendInfluencerNotificationMail(recipient, title, message) {

        let mailOptions = {
            from: '"Hello From Adbasador MarketPlace"<noreply@adbasador.com>',
            cc: config.supportmail,
            to: recipient,
            subject: title,
            text: message,
            html: message
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendPremiumRevertedMail: function sendPremiumRevertedMail(recipient) {
        let mailOptions = {
            from: '"Hello From Adbasasor Plus"<noreply@adbasador.com>',
            to: recipient,
            subject: 'Premium status reverted',
            text: 'Hello! This is to inform you that your account has been been reverted from premium user to ordinary account. This is following your failure to fund your wallet with sufficient balance. When you are ready to upgrade again, follow the same process. Thank you for choosing us.',
            html: 'Hello !<br><br>This is to inform you that your account has been been reverted from premium user to ordinary account. ' +
            '<br>This is following your failure to fund your wallet with sufficient balance. ' +
            '<br>When you are ready to upgrade again, follow the same process. ' +
            '<br><br>Thank you for choosing Adbasador Plus.'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendPremiumPendingReminderMail: function sendPremiumPendingReminderMail(recipient, count) {
        let mailOptions = {
            from: '"Hello From Adbasasor Plus"<noreply@adbasador.com>',
            to: recipient,
            subject: 'Insufficient balance reminder',
            text: 'Hello! This is to remind you that your balance is insufficient for you to continue to enjoy premium features. Your premium status will automatically be reverted after 3 attempts if you don"t fund your account. Thank you for choosing us.',
            html: 'Hello !<br><br>This is to remind you that your balance is insufficient for you to continue to enjoy premium features. ' +
            '<br>Your premium status will automatically be reverted after 3 days if you don"t fund your account. ' +
            '<br><br>Thank you for choosing Adbasador Plus.'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error, ' : ', new Date());
            }
        });
    },

    sendIdentityApprovalMail: function sendIdentityApprovalMail(recipients, fullname){

		var mailOptions = {
		    from: '"Hello From Adbasador Plus" <noreply@adbasador.com>', // sender address
		    to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
		    subject: 'Identity Approval ✔', // Subject line
		    text: 'Hello Admin! Please login to review and approve social media handles and identity of ' + fullname + ".", // plaintext body
		    html: 'Hello Admin!<br><br> Please login to review and approve social media handles and identity of ' + fullname + "." // html body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log('Mail Error: ', error, ' : ', new Date());
		    }
		});
	},

    sendWelcomeMail: function sendWelcomeMail(recipient){

		var mailOptions = {
		    from: '"Hello From Adbasador Plus" <noreply@adbasador.com>', // sender address
		    to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
		    subject: 'Welcome ✔', // Subject line
			text: 'Hello! Welcome to Adbasador Plus and thank you for signing up. However, to be able to apply for adverts ' +
					'and earn from running advert campaigns, you need to update your profile and provide the required ' +
					'information and be approved. Thank you for choosing Adbasador Plus! The Adbasador Plus Team. www.adbasador.com', // plaintext body

			html: 'Hello! Welcome to Adbasador Plus and thank you for signing up.<br><br> ' +
				   'In just a few steps, you can start earning by updating your profile on the app.<br><br> ' +
				   'Thereafter, your account will be approved and verified within 1 hour and this will enable you apply for adverts.<br><br>' +
				   'Once more, thank you for choosing Adbasador Plus. We can"t wait to see the great things you will get up to. <br><br>' +
				   'The Adbasador Plus Team<br><a target="_blank" href="www.adbasador.com">www.adbasador.com</a>' // html body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log('Mail Error: ', error, ' : ', new Date());
		    }
		});
	},

	sendAccountApprovedMail: function sendAccountApprovedMail(recipient, fullname){

		var mailOptions = {
		    from: '"Hello From Adbasador Plus" <noreply@adbasador.com>', // sender address
		    to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
		    subject: 'Welcome ✔', // Subject line
		    text: 'Hello! ' + fullname +' This is to inform you that your social media handles have been verified and your account approved. You can now head over to the app and start applying for available adverts. Thank you for choosing Adbasador Plus! The Adbasador Plus Team. www.adbasador.com', // plaintext body
		    html: 'Hello! ' + fullname + '<br><br>This is to inform you that your social media handles have been verified and your account approved. You can now head over to the app and start applying for available adverts. <br><br> Thank you for choosing Adbasador Plus!<br><br>The Adbasador Plus Team<br><a target="_blank" href="www.adbasador.com">www.adbasador.com</a>' // html body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log('Mail Error: ', error, ' : ', new Date());
		    }
		});
	},

	sendAccountRejectedMail: function sendAccountRejectedMail(recipient, fullname, reason) {
		var mailOptions = {
		    from: '"Hello From Adbasador Plus" <noreply@adbasador.com>', // sender address
		    to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
		    subject: 'Notification ✔', // Subject line
		    text: 'Hello! ' + fullname +' This is to inform you that we are unable to verify your social media handles due to the following reason(s): ' + reason + ' Thank you for choosing Adbasador Plus! The Adbasador Plus Team. www.adbasador.com', // plaintext body
		    html: 'Hello! ' + fullname + '<br><br>This is to inform you that we are unable to verify your social media handles due to the following reason(s): <br><br>' + reason + '<br><br> As a result, you will not be able to apply for and run advert campaigns. Please rectify these issues to continue enjoying Adbasador Plus.<br><br. Thank you for choosing Adbasador Plus!<br><br>The Adbasador Plus Team<br><a target="_blank" href="www.adbasador.com">www.adbasador.com</a>' // html body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log('Mail Error: ', error, ' : ', new Date());
		    }
		});
	},

	sendHandlesChangedMail: function sendHandlesChangedMail(recipient, fullname) {
		var mailOptions = {
		    from: '"Hello From Adbasador Plus" <noreply@adbasador.com>', // sender address
		    to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
		    subject: 'Notification ✔', // Subject line
		    text: 'Hello! ' + fullname +' We noticed you changed your social media handle(s). Hence you will not able to apply for adverts within the next 1 hour as your account will be undergoing another review. Thank you for choosing Adbasador Plus! The Adbasador Plus Team. www.oyabuzz.me', // plaintext body
		    html: 'Hello! ' + fullname + '<br><br>We noticed you changed your social media handle(s). Hence you will not able to apply for adverts within the next 1 hour as your account will be undergoing another review. <br> You will be promptly notified once that is over.<br><br. Thank you for choosing Adbasador Plus!<br><br>The Adbasador Plus Team<br><a target="_blank" href="www.adbasador.com">www.adbasador.com</a>' // html body
		};

		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log('Mail Error: ', error, ' : ', new Date());
		    }
		});
	},
};