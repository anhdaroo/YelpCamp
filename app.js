const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); //Also need app.use
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate'); //Needs app.engine below
const Joi = require('joi');
const {campgroundSchema} = require('./schemas.js');
const Campground = require('./models/campground');


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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

// We don't wanna use a app.use because it'll run on every route
// We want them selectively appliied
const validateCampground = (req, res, next) => {
        // Second layer of prevention for things like PostMan, before we only had error handling for web-based requets 
        // const campgroundSchema = Joi.object ({
        //     campground: Joi.object({
        //         title: Joi.string().required(),
        //         price: Joi.number().required().min(0),
        //         image: Joi.string().required(),
        //         location: Joi.string().required(),
        //         description: Joi.string().required()
        //     }).required()
        // })
        //Moved to schemas.js
        
        // const result = campgroundSchema.validate(req.body);
        // [object Object] Its an array so need to destructure
    
        const { error } = campgroundSchema.validate(req.body);
    
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            // throw new ExpressError(error.details, 400)
            throw new ExpressError(msg , 400)
        } else {
            //This will let the move through the route handlers
            next();
        }
    
        // From Console 
        // {
        //     value: { campground: { title: 'Hey' } },
        //     error: [Error [ValidationError]: "campground.price" is required] {
        //       _original: { campground: [Object] },
        //       details: [ [Object] ]
        //     }
        // }
          
        // console.log(result);
}

app.get('/', (req, res) => {
    // res.send('Hello from YELP CAMP')
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//This needs to come before :id otherwise it will treat /new as the id
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    //This will not work down below because the req.body has not been parsed yet
    //Needs: app.use(express.urlencoded({extended: true}))
    //Output {"campground":{"title":"test","location":"test"}} Its in campground
    // res.send(req.body);
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); PRE JOI


    const campground = new Campground(req.body.campground);
    await campground.save();

    //Make sure campgrounds is plural and matches one of the routes
    res.redirect(`/campgrounds/${campground._id}`);


}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    // const { id } = req.params;
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    // res.send('IT WORKED')
    // if we see it worked in html form sending real put request through POST
    //Check edit.ejs
    //We make it to that put route with the POST request from edit.ejs
    const { id } = req.params;
    // Campground.findByIdAndUpdate(id, {title: 'asdfa', location: ''})
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("HI");
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    // res.send('404!!!!')
    // Needs const ExpressError = require('./utils/ExpressError');
    next(new ExpressError('Page Not Found!', 404))
})

app.use((err, req, res, next) => {
    // Next from prev gets sent to err (new ExpressError('Page Not Found', 404)) or another error from different route
    const { statusCode = 500 } = err;
    // constructor(message, statusCode) { from ExpressError.js 
    // res.status(statusCode).send(message)
    // res.status(statusCode).render('errors')
    if (!err.message) {
        err.message = "Oh no, something went wrong!"
    }
    res.status(statusCode).render('errors', { err })
    // res.send('OH boy, something went wrong!')
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