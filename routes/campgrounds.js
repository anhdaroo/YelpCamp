const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema } = require('../schemas.js');

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



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//This needs to come before :id otherwise it will treat /new as the id
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //This will not work down below because the req.body has not been parsed yet
    //Needs: app.use(express.urlencoded({extended: true}))
    //Output {"campground":{"title":"test","location":"test"}} Its in campground
    // res.send(req.body);
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); PRE JOI

    
    const campground = new Campground(req.body.campground);
    await campground.save();

    req.flash('success', 'Successfully made a new campground!')
    //Make sure campgrounds is plural and matches one of the routes
    res.redirect(`/campgrounds/${campground._id}`);


}))

//This is our showpage, populates reviews
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    //Can do this to get flash message res.render('campgrounds/show', { campground, msg: req.flash("success") });

}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    // const { id } = req.params;
    const campground = await Campground.findById(req.params.id)

    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', catchAsync(async (req, res) => {
    // res.send('IT WORKED')
    // if we see it worked in html form sending real put request through POST
    //Check edit.ejs
    //We make it to that put route with the POST request from edit.ejs
    const { id } = req.params;
    // Campground.findByIdAndUpdate(id, {title: 'asdfa', location: ''})
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("HI");
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');

}))

module.exports = router;