const userModel = require('../models/user');
const itemModel = require('../models/item');
const offerModel = require('../models/offer');
const watchModel = require('../models/watch');

exports.newUser = (req, res)=>{
    return res.render('./user/newUser');
};

exports.create = (req, res, next)=>{
    let user = new userModel(req.body);             // add a new user profile document 
    user.save()                                     // insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/newUser');
        }
        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/newUser');
        }
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    return res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    userModel.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');  
            res.redirect('/users/login');
        } 
        else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } 
                else {
                    req.flash('error', 'Wrong password');      
                    res.redirect('/users/login');
                }
            });     
        }     
    })
    .catch(err => next(err)); 
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([userModel.findById(id), itemModel.find({owner: id}), 
        offerModel.find({$or: [{initiator: id}, {offeree: id}] }).populate('optionItem', 'title artist img').populate('interestItem', 'title artist img').populate('initiator', 'userName').populate('offeree', 'userName'), watchModel.find({user: id}).populate('watchedItem', 'title artist status img')]) 
    .then(results=>{
        const [user, trades, offers, watchlists] = results;
        let sentOffers = [];
        let receivedOffers = [];
        offers.forEach((offer) => {
            if (offer.status == 'Pending') {
                if (offer.initiator._id == id) {
                    sentOffers.push(offer);
                }
                if (offer.offeree._id == id) {
                    receivedOffers.push(offer);
                }
            }
        });
        res.render('./user/profile', {user, trades, sentOffers, receivedOffers, watchlists});
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
};