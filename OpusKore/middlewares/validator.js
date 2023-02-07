const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if (id == undefined) {
        id = req.body.itemID
    }
    // check if object is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(), 
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
body('userName', 'Username cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be at least 8 characters and 64 characters at most').isLength({min: 8, max: 64})];

exports.validateItem = [body('title', 'Title cannot be empty').notEmpty().trim().escape(), 
body('artist', 'Artist cannot be empty').notEmpty().trim().escape(), 
body('genre', 'Genre cannot be empty').notEmpty().trim().escape(), 
body('price', 'Minimum price value is 5 and maximum is 500').trim().escape().isFloat({min: 5, max: 500}), 
body('details', 'Product details must be at least 10 characters').trim().escape().isLength({min: 10}), 
body('img').escape()];

exports.validateOffer = [body('optionItem', 'The offer\'s option item is required').notEmpty().trim().escape()];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error =>{
            req.flash('error', error.msg);
        })
        return res.redirect('back');
    } 
    else {
        return next();
    }
}