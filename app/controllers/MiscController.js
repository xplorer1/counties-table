let UserModel = require('../models/UserModel');
let RestaurantModel = require('../models/RestaurantModel');

let imageId = function () {
    return Math.random().toString(36).substr(2, 10);
};

const AWS = require('aws-sdk');

const config = require('../../config');

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

    deleteRestaurantByEmail: async function(req, res) {
        if(!req.body.email) return res.status(400).json({status: 400, message: "email required."});
        let email = req.body.email.trim();

        try {
            let user = await UserModel.findOne({email: email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            await UserModel.deleteOne({email: email}).exec();
            await RestaurantModel.deleteOne({email: email}).exec();

            return res.status(200).json({status: 200, message: 'User has been deleted'});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    uploadFileToS3: async function(req, res) {
        let file_stream = fs.createReadStream(req.file.path);

        let params = {
            Bucket: config.aws_s3.BUCKET_NAME,
            Key: imageId(),
            Body: file_stream
        };

        s3.upload(params, async function(err, data) {
            if (err) {
                return res.status(500).json({status: 500, message: err.message});
            }

            console.log("key: ", data.key);
            
            return res.status(200).json({message: "Success."});
        });
    }
}