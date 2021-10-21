const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //Needs app.engine below
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); //Also need app.use

const Joi = require('joi');

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        // secure: true
        //For security reasons, it is default
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }

}
app.use(session(sessionConfig))
// npm i connect-flash
app.use(flash());

app.use((req, res, next ) => {
    //In Boilerplate. This funciton is supposed to be a middleware that passes it on, need next
    res.locals.success = req.flash('success');
    next();
})

app.use('/campgrounds', campgrounds)

//We don't get the :id route in the params thats why we have ot merge
app.use('/campgrounds/:id/reviews', reviews )

app.get('/', (req, res) => {
    // res.send('Hello from YELP CAMP')
    res.render('home')
})





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