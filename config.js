module.exports = {
    'port': process.env.PORT || 80,

    'base_url': "http://ec2-18-191-242-77.us-east-2.compute.amazonaws.com",
    'nexmo': {
        'BASE_URL' : "https://messages-sandbox.nexmo.com/",
        'MESSAGES_API_URL': "https://messages-sandbox.nexmo.com/v0.1/messages",
        "WHATSAPP_NUMBER" : "14157386170",
        "VONAGE_API_SECRET" : "hVPvoNojkTjXZ0aa",
        "VONAGE_API_KEY" : "6232d907",
        "VONAGE_APPLICATION_ID" : "2cc80ce9-7555-4a3c-93e3-34bf9569b95c",
        "VONAGE_APPLICATION_PRIVATE_KEY_PATH" : "/Users/chijioke/death-valley/nexmo_private.key",
        "TO_NUMBER": "2348103350884",
        "SMS_SENDER" : "Stream Eats"
    },

    'database': 'mongodb://localhost:27017/streameats',

    //'database' : 'mongodb+srv://phantom-admin:Pe4NFrsQFz2Pv2pX@cluster0.08uuj.mongodb.net/streameats?retryWrites=true&w=majority',

    'secret': '*KUITUR!GJ@L8BV9*4*JVLY$&*CCD!O$RTRD2$4U)HPUL!UG)XR(6&AWIMYG4B(6&Q3L&YDLJFJ*P1S4HJA$T$4*X2HC80WGF3VOT1!AMDNM6LQ1G6YXMRB@%3K2$30MOP7*X5WCF$(@IUA*52I1P(KVRIO807J^8G7$XFH!P(0EV#HJF1X&4#VB5XWVJTTD)STWV6R$IYS6&%V80D9VL0M#N79%XR3BP&S$1C4IWU20W6U6HST5S32($S%8&06X)VOR!*^QTONN*FYPOP3#@UM5^2)C81MK9TK!14LQFO7!',
    'hash' : 'FPIL9X^4BAXL0HX0D(YNLXOJLK)U!W5S6R&FSMSCG#@X*VNF3BAYG@!UX$NGSTCWXTPMN1%%%W$30GEA@@BQG4FO^N2$1(Y8*5G29LP!AN3W($%@Y825OS0$M90Q9%)7G^9F$J9LH#^9^O&OD9^B)VVM#TH2N#(@0AD8Q!YVG)BP#01UYBOFTLD&XNRTXG@@)!Q*@X)E#MLK@JO7X3404VP&92ID0K&^U02YLOH^GKE(9EU)SEEGKG%!BJ0$AABKJFGFIJU7(9S0UOG1&I4VRQ*!MYFG%YKXDPNM0UFRI#P&',
    'paystack_sk' : "sk_test_689c0e55568dfc4fcb8a9e6c71f1d3eb7e7c3dd1",
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