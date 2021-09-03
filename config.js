module.exports = {
    "port": process.env.PORT || 9000,

    "base_url": "http://ec2-18-191-242-77.us-east-2.compute.amazonaws.com",

    "send_grid": {
        "api_key": "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"
    },

    "nexmo": {
        'BASE_URL' : "https://messages-sandbox.nexmo.com/",
        'MESSAGES_API_URL': "https://messages-sandbox.nexmo.com/v0.1/messages",
        "WHATSAPP_NUMBER" : "14157386170",
        "VONAGE_API_SECRET" : "hVPvoNojkTjXZ0aa",
        "VONAGE_API_KEY" : "6232d907",
        "VONAGE_APPLICATION_ID" : "2cc80ce9-7555-4a3c-93e3-34bf9569b95c",
        "SMS_SENDER" : "Stream Eats"
    },

    "aws_s3" : {
        "BUCKET_NAME" : "streameats",
        "ACCESS_KEY_ID": "AKIARXBKP6BOV6U4ZNGE",
        "SECRET_ACCESS_KEY": "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",
        "REGION": "us-east-1",
        "GRANTEE": ""
    },

    "aws_cli": {
        "ACCESS_KEY_ID" : "AKIARXBKP6BORGKYNUMF",
        "SECRET_KEY_ACCESS_KEY" : "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"
    },

    "twilio": {
        "ACCOUNT_SID": "AC7920a12edee830d37a1a75e75d7262b5",
        "API_KEY": "SK9fe6990dfa8c85a7d6777b96c43f001a",
        "API_SECRET": "P28Dn1SHoGJstdyMvcJfXvlvCUGkycln"
    },

    //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
    //ssh -i /Users/chijioke/death-valley/stream_eats.pem ubuntu@ec2-54-196-51-20.compute-1.amazonaws.com

    //"database": "mongodb://localhost:27017/streameats", //for production

    'database' : 'mongodb+srv://phantom-admin:Pe4NFrsQFz2Pv2pX@cluster0.08uuj.mongodb.net/streameats?retryWrites=true&w=majority', //for testing.

    "secret": "*KUITUR!GJ@L8BV9*4*JVLY$&*CCD!O$RTRD2$4U)HPUL!UG)XR(6&AWIMYG4B(6&Q3L&YDLJFJ*P1S4HJA$T$4*X2HC80WGF3VOT1!AMDNM6LQ1G6YXMRB@%3K2$30MOP7*X5WCF$(@IUA*52I1P(KVRIO807J^8G7$XFH!P(0EV#HJF1X&4#VB5XWVJTTD)STWV6R$IYS6&%V80D9VL0M#N79%XR3BP&S$1C4IWU20W6U6HST5S32($S%8&06X)VOR!*^QTONN*FYPOP3#@UM5^2)C81MK9TK!14LQFO7!",
    "env" : "development",
    
    generateCode: function () {
        var length = 10,
            charset = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXY",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },

    validateEmail: function (email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    checkImageSize: function (img) {
        const buffer = Buffer.from(img.substring(img.indexOf(',') + 1));
        
        return buffer.length/1e+6;
    }
}