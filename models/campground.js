const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,

    //New
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
            //It is an object ID referencing a Review Model
        }
    ]
})

module.exports = mongoose.model('Campground', CampgroundSchema);