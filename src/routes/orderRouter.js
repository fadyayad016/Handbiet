const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');

const router = express.Router();

const orderController = require('../controllers/orderController');  

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware,ensureCustomerRole, orderController.createOrder); 

router.get('/', authMiddleware,ensureCustomerRole, orderController.getOrders); 

router.get('/cook', authMiddleware, ensureCookRole, orderController.getOrderByCookId);


module.exports = router;



