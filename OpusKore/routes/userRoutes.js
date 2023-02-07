const express = require('express');
const userController = require('../controllers/userController');
const {loginLimiter} = require('../middlewares/rateLimiter');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {validateSignUp, validateId, validateLogIn, validateResult} = require('../middlewares/validator');

const router = express.Router();

router.use(function(err, req, res, next) {
    console.log('Error Handler');
    res.status(err.status || 500);
    res.render('Error: ', {error:err, message:err.message, url:req.url});
});

router.get('/newUser', isGuest, userController.newUser);
router.get('/login', isGuest, userController.getUserLogin);
router.get('/profile', isLoggedIn, userController.profile);
router.get('/logout', isLoggedIn, userController.logout);

router.post('/login', loginLimiter, isGuest, validateLogIn, validateResult, userController.login);
router.post('/', isGuest, validateSignUp, validateResult, userController.create);

module.exports = router;