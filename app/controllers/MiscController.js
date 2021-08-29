let UserModel = require('../models/UserModel');
let RestaurantModel = require('../models/RestaurantModel');

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
    }
}