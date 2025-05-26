const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middlewares/authMiddleware');
const ensureCustomerRole = require('../middlewares/ensureCustomerRole');
const ensureCookRole = require('../middlewares/ensureCookRole');

// Cook routes
router.get('/mymeals', authMiddleware, ensureCookRole, mealController.getMyMeals);
router.post('/', authMiddleware,ensureCookRole, mealController.addMeal);
router.put('/:id', authMiddleware,ensureCookRole, mealController.updateMeal);
router.delete('/:id', authMiddleware,ensureCookRole, mealController.deleteMeal);

// //for cook
// router.post('/favorites/cooks/:id', authMiddleware, userController.addFavoriteCook);
//for meal 
router.post('/favorites/:id', authMiddleware,ensureCustomerRole, mealController.addFavoriteMeal);  
router.delete('/favorites/:id', authMiddleware,ensureCustomerRole, mealController.removeFavoriteMeal); 
// Public
router.get('/', mealController.browseMeals);
router.get('/BestSellerMeal',mealController.getBestSellerMeal)

module.exports = router;
