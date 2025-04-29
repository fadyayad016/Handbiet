// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const user= require('../controllers/userController');


const { validateRegister } = require('../validators/authValidator');

const authMiddleware= require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validateRegister, authController.register);

router.post('/Login', authController.login);

router.get('/getCurrentUser', authMiddleware,user.getCurrentUser)
router.post('/updateCurrentUser', authMiddleware,user.updateCurrentUser)


module.exports = router;
