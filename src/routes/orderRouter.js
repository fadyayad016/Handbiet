const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');

const router = express.Router();

const orderController = require('../controllers/orderController');  

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware,ensureCustomerRole, orderController.createOrder); 

router.get('/', authMiddleware,ensureCustomerRole, orderController.getOrders); 



module.exports = router;



