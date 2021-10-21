const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

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

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // console.log("DELETED!!!!!")
    console.log(doc)
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
// db.reviews.find()

// doc gets passed through in the middleware function and can delete all the reviews: 
// doc
// {
//     reviews: [],
//     _id: new ObjectId("61675aeaa2f5760b2e37bdd5"),
//     title: 'Petrified Creekside',
//     image: 'https://source.unsplash.com/collection/483251',
//     price: 26,
//     description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit minima dignissimos sunt eveniet dolores expedita laboriosam velit facilis? Officia tenetur praesentium explicabo magni. Deserunt id aperiam dolores labore enim perferendis!',
//     location: 'Apex, North Carolina',
//     __v: 0
//   }
  
module.exports = mongoose.model('Campground', CampgroundSchema);