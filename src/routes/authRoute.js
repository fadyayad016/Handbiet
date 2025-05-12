// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');



const { validateRegister } = require('../validators/authValidator');

const authMiddleware= require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validateRegister, authController.register);

router.post('/Login', authController.login);

router.post('/refreshAccessToken', authController.refreshToken);






module.exports = router;
