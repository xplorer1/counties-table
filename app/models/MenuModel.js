var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var MenuSchema = new Schema({
    'description' : String,
    'menu_image': String,
    'restaurant' : {
       type: Schema.Types.ObjectId,
       ref: 'Restaurant'
    },
    'price' : {type: Number},
    'created_on': {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Menu', MenuSchema);