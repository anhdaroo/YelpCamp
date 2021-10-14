const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground')

//const db = mongoose.connection;
main().catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!");
    console.log(err);
});

async function main() {
    console.log("Mongo Connection Open!!!!");
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');

}

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

// const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({ title: 'purple field' });
    // await c.save();
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit minima dignissimos sunt eveniet dolores expedita laboriosam velit facilis? Officia tenetur praesentium explicabo magni. Deserunt id aperiam dolores labore enim perferendis!',
            price
        })
        await camp.save();
    }
}

//seedDB returns a promise because it is an async function 
// seedDB();

seedDB().then(() => {
    mongoose.connection.close();
})


