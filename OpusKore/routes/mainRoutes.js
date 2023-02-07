const express = require('express');
const contoller = require('../controllers/mainController')
const router = express.Router();

router.use(function(err, req, res, next) {
    console.log('Error Handler');
    res.status(err.status || 500);
    res.render('Error: ',{error:err,message:err.message,url:req.url});
  });

router.get('/', contoller.index);
router.get('/about', contoller.about);
router.get('/contact', contoller.contact);

module.exports = router;