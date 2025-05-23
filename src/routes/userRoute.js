const express = require('express');

const user= require('../controllers/userController');
const router = express.Router();
const { validateRegister } = require('../validators/authValidator');

const authMiddleware= require('../middlewares/authMiddleware');

router.get('/getCurrentUser', authMiddleware,user.getCurrentUser)
router.post('/updateCurrentUser', authMiddleware,user.updateCurrentUser)

router.get('/cooks', user.listAllCooks);
router.get('/cooks/:id', user.getCookById);
router.get('/favoritecooks',authMiddleware, user.getFavoriteCooks);

router.post('/favorites/:cookId', authMiddleware, user.addFavoriteCook);

router.delete('/favorites/:cookId', authMiddleware, user.removeFavoriteCook);

module.exports = router;
