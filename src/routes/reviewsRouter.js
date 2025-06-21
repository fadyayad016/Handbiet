const express = require('express');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');
const ensureAdminRole = require('../middlewares/ensureAdminRole');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const reviewsController = require('../controllers/reviews');



router.post('/addReview', authMiddleware, ensureCustomerRole, reviewsController.addReview);

router.get('/getReviewsByMeal/:id', reviewsController.getmealreviews);
router.get('/getbestcooks', reviewsController.getBestCooks);    
module.exports = router;
