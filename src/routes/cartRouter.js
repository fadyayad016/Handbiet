const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');


// Customer Cart Routes
router.post('/', authMiddleware,ensureCustomerRole, cartController.addToCart);         
router.get('/', authMiddleware,ensureCustomerRole, cartController.getCart);              
router.put('/', authMiddleware, ensureCustomerRole, cartController.updateCartItem);      
router.delete('/:mealId', authMiddleware,ensureCustomerRole, cartController.removeCartItem);

module.exports = router;