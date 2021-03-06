
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//Capital, Singularized Review Basic Model
//We have to connect one review with a campground
//One to many relationship
module.exports = mongoose.model("Review", reviewSchema);