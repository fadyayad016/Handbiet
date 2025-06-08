const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');

const router = express.Router();

const orderController = require('../controllers/orderController');  

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware,ensureCustomerRole, orderController.createOrder); 

router.get('/', authMiddleware,ensureCustomerRole, orderController.getOrders); 

router.get('/cook', authMiddleware, ensureCookRole, orderController.getOrderByCookId);

router.post('/payment', authMiddleware, ensureCustomerRole, orderController.payment);
router.put('/updatestatus', authMiddleware, ensureCookRole, orderController.updateOrderStatus);
router.get('/notifications', authMiddleware, orderController.getAllNotifications);  
router.put('/notifications/read', authMiddleware, orderController.updateNotificationReadStatus);
router.put('/notifications/mark-all-as-read', authMiddleware, orderController.markAllNotificationsAsRead);
module.exports = router;



