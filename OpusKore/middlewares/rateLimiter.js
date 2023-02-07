const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 5,
    handler: (req, res, next) => {
        let err = new Error("Too many login requests. Try again later");
        err.status = 429;
        req.flash('error', err.message);  
        return res.redirect('back');
    }
});