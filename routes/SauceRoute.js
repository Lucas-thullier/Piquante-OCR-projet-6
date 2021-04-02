const express = require('express');
const router = express.Router();

/* Middleware */
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); 

const sauceController = require('../controllers/SauceController');

/* GET */
router.get('/sauces', auth, sauceController.getAllSauces);
router.get('/sauces/:id', auth, sauceController.getOneSauce);

/* POST */
router.post('/sauces', auth, multer, sauceController.createOneSauce);
router.post('/sauces/:id/like', auth, sauceController.defineLike); // définit le statut j'aime pour userID fourni

/* PUT */
router.put('/sauces/:id', auth, multer, sauceController.modifySauce);

/* DELETE */
router.delete('/sauces/:id', auth, sauceController.deleteSauce);


module.exports = router;