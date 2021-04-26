var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var AvailableAdsSchema = new Schema({
    'name' : String,
    'advert' : String,
    'createdon' : {type: Date, default: new Date()},
    'slots' : {type: Number, default: 0},
    'slotsleft' : {type: Number, default: 0},
    'category' : String,
    'from' : Date,
    'to' : Date,
    'duration' : {type: Number, default: 0},
    'advertinfo' : String,
    'channels' : {type: [String]},
    'description' : String,
    'location' : String,
    'owner' : {
       type: Schema.Types.ObjectId,
       ref: 'MarketPlaceBrand'
    },
    'influencers' : {type: [String]},
    'influencerscompleted': {type: [String]},
    'influencerinfo' : {
        'followersfrom': {type: Number},
        'followersto': {type: Number},
        'location': {type: [String]},
        'interests': {type: [String]}
    },
    'budgetfrom': {type: Number, default: 0},
    'budgetto': {type: Number, default: 0},
    'reach' : {type: Number, default: 0},
    'comments' : [{
        'from' : String,
        'comment' : String
    }],
    'views' : {type: Number, default: 0},
    'class' : String,
    'type' : {type: String, default: "available"}, //available or live
    'status' : {type: String, default: "PENDING"} , //pending or active
    'paidfor' : {type: Boolean, default: true},
    'deactivated' : {type: Boolean, default: false},
    'deactivatedon' : Date,
    'caption' : String,
    'website': String,

});

module.exports = mongoose.model('AvailableAds', AvailableAdsSchema);