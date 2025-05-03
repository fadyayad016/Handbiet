const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middlewares/authMiddleware');

// Cook routes
router.get('/mymeals', authMiddleware, mealController.getMyMeals);
router.post('/', authMiddleware, mealController.addMeal);
router.put('/:id', authMiddleware, mealController.updateMeal);
router.delete('/:id', authMiddleware, mealController.deleteMeal);

// //for cook
// router.post('/favorites/cooks/:id', authMiddleware, userController.addFavoriteCook);
//for meal 
router.post('/favorites/:id', authMiddleware, mealController.addFavoriteMeal);  
router.delete('/favorites/:id', authMiddleware, mealController.removeFavoriteMeal); 
// Public
router.get('/', mealController.browseMeals);

module.exports = router;
