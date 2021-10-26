const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//This needs to come before :id otherwise it will treat /new as the id
router.get('/new', isLoggedIn, (req, res) => {

    res.render('campgrounds/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //This will not work down below because the req.body has not been parsed yet
    //Needs: app.use(express.urlencoded({extended: true}))
    //Output {"campground":{"title":"test","location":"test"}} Its in campground
    // res.send(req.body);
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); PRE JOI

    
    const campground = new Campground(req.body.campground);
    //associates author with the campground
    campground.author = req.user._id;
    await campground.save();

    req.flash('success', 'Successfully made a new campground!')
    //Make sure campgrounds is plural and matches one of the routes
    res.redirect(`/campgrounds/${campground._id}`);


}))

//This is our showpage, populates reviews
router.get('/:id', catchAsync(async (req, res) => {
    // const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        author: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    //Can do this to get flash message res.render('campgrounds/show', { campground, msg: req.flash("success") });

}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    // const campground = await Campground.findById(req.params.id)
    // const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    // if (!campground.author.equals(req.user._id)) {


    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    // res.send('IT WORKED')
    // if we see it worked in html form sending real put request through POST
    //Check edit.ejs
    //We make it to that put route with the POST request from edit.ejs
    const { id } = req.params;
    // const campground = await Campground.findById(id);
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that!');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    // Campground.findByIdAndUpdate(id, {title: 'asdfa', location: ''})
    // const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true })
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    // const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    // console.log("HI");
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');

}))

module.exports = router;