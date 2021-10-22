const express = require('express');
// Cannot read property 'reviews' of null
//Express router usually keeps params separate
const router = express.Router({ mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

//Joi schema
const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
//Considered Middlware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // throw new ExpressError(error.details, 400)
        throw new ExpressError(msg , 400)
    } else {
        //This will let the move through the route handlers
        next();
    }
}

//Show.ejs
//Needs const Review = require('./models/review');
router.post('/', validateReview, catchAsync(async (req, res) => {
    // res.send('YOU MADE IT!!!')
    const campground = await Campground.findById(req.params.id)
    // review[rating]
    const review = new Review(req.body.review);
    //All under review[rating] 'review'
    //in cmapground.js reviews array
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Delete a review
// <form action="/campgrounds/<%=campground._id%>/reviews/<%=review._id%>?_method=DELETE" method="POST">
router.delete('/:reviewId', catchAsync(async (req, res) => {
    //Need to set up form because method override, delete form on show page fore each review
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    // res.send("DELETE ME!!!")
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;