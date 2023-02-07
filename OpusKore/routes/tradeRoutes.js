const express = require('express');
const tradeController = require('../controllers/tradeController')
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId, validateItem, validateOffer, validateResult} = require('../middlewares/validator');

const router = express.Router();

router.use(function(err, req, res, next) {
  console.log('Error Handler');
  res.status(err.status || 500);
  res.render('Error: ',{error:err,message:err.message,url:req.url});
});

router.get('/', tradeController.trades);
router.get('/new', isLoggedIn, tradeController.new);
router.get('/tradeHistory', isLoggedIn, tradeController.tradeHistory);
router.get('/:id', validateId, tradeController.show);
router.get('/:id/edit', validateId, isLoggedIn, isAuthor, tradeController.edit);

router.post('/', isLoggedIn, validateItem, validateResult, tradeController.create);
router.post('/request', validateId, isLoggedIn, tradeController.request);
router.post('/offer', isLoggedIn, validateOffer, validateResult, tradeController.offer);
router.post('/watch', validateId, isLoggedIn, tradeController.watch);

router.put('/:id', validateId, isLoggedIn, validateItem, validateResult, isAuthor, tradeController.update);
router.put('/offer/update', isLoggedIn, tradeController.updateOffer);
router.put('/offer/accept', isLoggedIn, tradeController.acceptOffer);

router.delete('/:id', validateId, isLoggedIn, isAuthor, tradeController.delete);
router.delete('/watch/:id', validateId, isLoggedIn, tradeController.remove);

module.exports = router;