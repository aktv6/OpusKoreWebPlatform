const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    initiator: {type: Schema.Types.ObjectId, ref:'User'},
    offeree: {type: Schema.Types.ObjectId, ref:'User'},
    optionItem: {type: Schema.Types.ObjectId, ref:'Item'},
    interestItem: {type: Schema.Types.ObjectId, ref:'Item'},
    status: {type: String, required: [true, 'Status attribute is required'], enum: [ "Pending", "Rejected", "Withdrawn", "Traded"]},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date}
});

module.exports = mongoose.model('offer', offerSchema);