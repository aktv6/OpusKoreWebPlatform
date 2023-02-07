// import model 
const itemModel = require("../models/item");
const userModel = require('../models/user');
const offerModel = require('../models/offer');
const watchModel = require('../models/watch');

// render collection items 
exports.trades = (req, res, next) => {
    itemModel.find()
    .then(trades=>{
        const genres = {};
        trades.forEach((trade) => {
            if (trade.genre in genres) {
                const values = genres[trade.genre];
                values.push(trade);
                genres[trade.genre] = values;
            }
            else {
                const value = [];
                value.push(trade);
                genres[trade.genre] = value;
            }
        });
        res.render("./trade/trades", {genres});
    }) 
    .catch(err=>next(err));
};


// render "create new item" page 
exports.new = (req, res) =>{
itemModel.find()
    .then(trades=>{
        const genres = new Set;
        trades.forEach((trade) => {
            genres.add(trade.genre)
        });
        res.render("./trade/newTrade", {genres});
    }) 
    .catch(err=>next(err));
};

exports.request = (req, res, next) =>{
    let initiatorId = req.session.user;
    let itemId = req.body.itemID;
    itemModel.find({$or: [{_id: itemId}, {owner: initiatorId}] })
    .then(items=>{
        let offerItem = {}
        let availableItems = []
        items.forEach((item) => {
            if (item._id == itemId) {
                offerItem = item;
            }
            else {
                if (item.status == 'Available') {
                    availableItems.push(item);
                }
            }
        });
        res.render("./trade/request", {offerItem, availableItems});
    })
    .catch(err=>next(err));
};

// process and add the new offer to the database 
exports.offer = (req, res, next) =>{
    let offer = new offerModel(req.body);                  // create a new offer document 
    offer.initiator = req.session.user;
    offer.status = "Pending";
    offer.save()                                           // save and add the doc to the database 
    .then(offer=>res.redirect("/users/profile"))
    .catch(err=> {
        if(err.name==="ValidationError"){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.updateOffer = (req, res, next) =>{
    let date = new Date;
    let id = req.body.offerID;
    let offerStatus = req.body.offerStatus;
    if(!offerStatus) {
        offerStatus = "Rejected";
    }
    let update = {offerID: id, status: offerStatus, updatedAt: date}
    offerModel.findByIdAndUpdate(id, update, {useFindAndModify: false, runValidators: true})
    .then(update =>{
        if (update) {
            res.redirect("/users/profile");
        } 
        else {
            let err = new Error("Cannot find a product with id " + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.acceptOffer = (req, res, next) =>{
    let id = req.body.offerID;
    let date = new Date
    let update = {offerID: id, status: "Traded", updatedAt: date}
    offerModel.findByIdAndUpdate(id, update, {useFindAndModify: false, runValidators: true})
    .then(update =>{
        if (update) {
            res.redirect("/users/profile");
        } 
        else {
            let err = new Error("Cannot find a product with id " + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

// process and add to the watchlist  
exports.watch = (req, res, next) =>{
    let watch = new watchModel(req.body);                  // create a new watchlist document 
    watch.user = req.session.user;
    watch.watchedItem = req.body.itemID;;
    watch.save()                                           // save and add the doc to the database 
    .then(watch=>res.redirect("back"))
    .catch(err=> {
        if(err.name==="ValidationError"){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.tradeHistory = (req, res, next) => {
    let id = req.session.user;
    Promise.all([userModel.findById(id), offerModel.find({$or: [{initiator: id}, {offeree: id}] }).populate('optionItem', 'title artist img').populate('interestItem', 'title artist img')])
    .then(results=>{
        const [user, offers] = results;
        let sentOffers = [];
        let receivedOffers = [];
        offers.forEach((offer) => {
            if (offer.status != 'Pending') {
                if (offer.initiator._id == id) {
                    sentOffers.push(offer);
                }
                if (offer.offeree._id == id) {
                    receivedOffers.push(offer);
                }
            }
        });
        res.render("./trade/tradeHistory", {user, sentOffers, receivedOffers});
    }) 
    .catch(err=>next(err));
};

// process and add the new item to the database 
exports.create = (req, res, next) =>{
    let trade = new itemModel(req.body);                   // create a new item document 
    let price = trade.price.toFixed(2);                    // format the price to round it to 2 decimals 
    let genLow = trade.genre.toLocaleLowerCase().replace(/[^a-z]/ig, "");   // format the genre
    let genre = genLow.charAt(0).toUpperCase() + genLow.slice(1)
    trade.owner = req.session.user;                        // add user's info 
    trade.genre = genre;
    trade.price = price;                                   // save formated price 
    trade.img = "/public/images_folder/item_0.jpg";        // add item image manually 
    trade.save()                                           // save and add the doc to the database 
    .then(trade=>res.redirect("/trades"))
    .catch(err=> {
        if(err.name==="ValidationError"){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};


// render called item's page and display that item's info 
exports.show = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user;
    Promise.all([itemModel.findById(id).populate('owner', 'userName'), watchModel.find({watchedItem: id}).populate('user')])
    .then(results=>{
        const [trade, watchlists] = results;
        let timestamp = trade.createdAt;
        let date = timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric',  year: 'numeric'})
        let time = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short'})
        let postDate = date + ' at ' + time;

        let watch = [];
        if (watchlists.length) {
            watchlists.forEach((w) => {
                if (w.user.id == userId) {
                    watch.push(w.id);
                }
            });
        }
        res.render('./trade/trade', {trade, postDate, watch});
    })
    .catch(err=>next(err));
};


// render called item's edit page and let the user to edit the item info 
exports.edit = (req, res, next) =>{
    let id = req.params.id;
    itemModel.findById(id)
    .then(trade=>{
        if(trade) {
            return res.render("./trade/edit", {trade});
        } 
        else {
            let err = new Error("Cannot find a product with id " + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};


// process the edited item and save changes to the database 
exports.update = (req, res, next) =>{
    let trade = req.body;
    let id = req.params.id;
    itemModel.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
    .then(trade =>{
        if (trade) {
            res.redirect("/trades/" + id);
        } 
        else {
            let err = new Error("Cannot find a product with id " + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};


exports.delete = (req, res, next) => {
    let id = req.params.id;
    itemModel.findByIdAndDelete(id, {useFindAndModify: false})
    .then(trade=>{
        if(trade) {
            res.redirect("/trades");
        } 
        else {
            let err = new Error("Cannot find a product with id " + id);
            err.status = 404;
            return next(err);
        }
    })    
    .catch(err=>next(err));
};


exports.remove = (req, res, next) => {
    let id = req.params.id;
    watchModel.findByIdAndDelete(id, {useFindAndModify: false})
    .then(watch=>{
        if(watch) {
            res.redirect('back');
        } 
        else {
            let err = new Error("Cannot find a watchlist with id " + id);
            err.status = 404;
            return next(err);
        }
    })    
    .catch(err=>next(err));
};