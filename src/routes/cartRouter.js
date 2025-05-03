const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Customer Cart Routes
router.get('/', authMiddleware, cartController.getCart);              
router.post('/', authMiddleware, cartController.addToCart);         
router.put('/', authMiddleware, cartController.updateCartItem);      
router.delete('/:mealId', authMiddleware, cartController.removeCartItem);

module.exports = router;