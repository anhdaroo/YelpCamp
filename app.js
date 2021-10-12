const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     useNewUrlParser: true,
//     // useCreateIndex: true,
//     useUnifiedTopology: true
// })

//const db = mongoose.connection;
main().catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!");
    console.log(err);
});

async function main() {
    console.log("Mongo Connection Open!!!!");
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  
}

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    // res.send('Hello from YELP CAMP')
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//This needs to come before :id otherwise it will treat /new as the id
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {

    //This will not work down below because the req.body has not been parsed yet
    //Needs: app.use(express.urlencoded({extended: true}))
    //Output {"campground":{"title":"test","location":"test"}} Its in campground
    // res.send(req.body);
    const campground = new Campground(req.body.campground);
    await campground.save();

    //Make sure campgrounds is plural and matches one of the routes
    res.redirect(`/campgrounds/${campground._id}`);

})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
})











// Test connection
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'My Backyard', description: 'cheap camping!'})
//     await camp.save();
//     res.send(camp)
// })

app.listen(3000, () => { 
    console.log("Serving on Port 3000")
})