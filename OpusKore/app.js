// required modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const mainRoutes = require('./routes/mainRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const userRoutes = require('./routes/userRoutes');


// create app
const app = express();


// configure app
let port = '####';
let host = '%%host%%';
app.set('view engine', 'ejs');


// connect to database 
mongoose.connect('mongodb://%%host%%:####/db', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    // start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));


// mount middlware
app.use(express.static('./public'));
app.use('/public/', express.static('./public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(flash());

app.use(
    session({
        secret: '%%key%%',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://%%host%%:####/db'}),
        cookie: {maxAge: 60*60*1000}
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;           // dynamic buttons 
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


// set up routes
app.use('/', mainRoutes);
app.use('/trades', tradeRoutes);
app.use('/users', userRoutes);


//url error handling 
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

//routes error handling 
app.use((err, req, res, next) => {
    if(!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }
    
    res.status(err.status);
    res.render('error', {error: err});
});