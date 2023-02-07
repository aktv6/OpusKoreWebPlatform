const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    title: {type: String, required: [true, 'Title attribute is required']},
    artist: {type: String, required: [true, 'Artist attribute is required']},
    owner: {type: Schema.Types.ObjectId, ref:'User'},
    genre: {type: String, required: [true, 'Category attribute is required']},
    price: {type: Number, required: [true, 'Price attribute is required'], min: [5, 'The minimum price amount is $5'], max: [500, 'The maximum price amount is $500']},
    status: {type: String, required: [true, 'Status attribute is required'], enum: [ "Available", "Unavailable", "Traded"]},
    details: {type: String, required: [true, 'Details attribute is required'], minLength: [10, 'Details should have at least 10 characters']},
    img: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Item', itemSchema);