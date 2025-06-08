const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');

const router = express.Router();

const adminDashboardController = require('../controllers/adminDashboard');
const authMiddleware = require('../middlewares/authMiddleware');







module.exports = router;
