const {campgroundSchema, reviewSchema } = require('./schemas.js'); //JOI object schema
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user);

    if (!req.isAuthenticated()) {
        //store the url they are requesting!
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');

        // Cannot set headers after they are sent to the client
    }
    next();
}

// const validateCampground = (req, res, next) => {
module.exports.validateCampground = (req, res, next) => {
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
        throw new ExpressError(msg, 400)
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

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// const isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         req.flash('error', 'You must be signed in first!');
//         return res.redirect('/login');

//         // Cannot set headers after they are sent to the client
//     }
//     next();
// }

//Considered Middlware
module.exports.validateReview = (req, res, next) => {
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