var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionJournalSchema = new Schema({
    'txnref': { type: String, required: true },
    'amount': { type: Number, required: true },
    'success': {type: Boolean, default: false},
    'title' : String,
    'customer' : {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    'type' : String,
    'createdon': { type: Date, default: Date.now }
});

module.exports = mongoose.model('TransactionJournal', TransactionJournalSchema);