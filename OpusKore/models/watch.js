const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref:'User'},
    watchedItem: {type: Schema.Types.ObjectId, ref:'Item'},
    addedOn: {type: Date, default: Date.now}
});

module.exports = mongoose.model('watchList', watchSchema);