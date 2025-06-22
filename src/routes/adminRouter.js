const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');
const ensureAdminRole = require('../middlewares/ensureAdminRole');

const router = express.Router();

const adminDashboardController = require('../controllers/adminDashboard');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/Users', authMiddleware,ensureAdminRole, adminDashboardController.getAllUsers); 
router.get('/ordersState', authMiddleware, ensureAdminRole, adminDashboardController.orderstates);
router.get('/totalRevenue', authMiddleware, ensureAdminRole, adminDashboardController.totalrevenue);   
router.get('/averageOrderValue', authMiddleware, ensureAdminRole, adminDashboardController.averageOrderValue); 
router.get('/monthlyRevenue', authMiddleware, ensureAdminRole, adminDashboardController.MonthlyRevenue);
router.get('/userGrowth', authMiddleware, ensureAdminRole, adminDashboardController.UserGrowth);
router.get('/getAllOrdersForAdmin', authMiddleware, ensureAdminRole, adminDashboardController.getAllOrders);  
router.get('/getAllUsersForAdmin', authMiddleware, ensureAdminRole, adminDashboardController.getAllUsersForAdmin);
router.put('/updateUserForAdmin/:id', authMiddleware, ensureAdminRole, adminDashboardController.updateUserForAdmin);
router.delete('/deleteUserForAdmin/:id', authMiddleware, ensureAdminRole, adminDashboardController.deleteUserForAdmin);
router.get('/ordermonitoring', authMiddleware, ensureAdminRole, adminDashboardController.ordermonitoring);
router.get('/getAdminOrderById/:id', authMiddleware, ensureAdminRole, adminDashboardController.getAdminOrderById);
router.get ('/getAllMealsForAdmin', authMiddleware, ensureAdminRole, adminDashboardController.getmealforadmin);
router.patch('/updateMealForAdmin/:id', authMiddleware, ensureAdminRole, adminDashboardController.updateMealstatusForAdmin);
module.exports = router;
