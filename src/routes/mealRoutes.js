const express = require("express");
const router = express.Router();
const mealController = require("../controllers/mealController");
const authMiddleware = require("../middlewares/authMiddleware");
const ensureCustomerRole = require("../middlewares/ensureCustomerRole");
const ensureCookRole = require("../middlewares/ensureCookRole");
const ensureAdminRole = require("../middlewares/ensureAdminRole");

// Cook routes
router.get(
  "/mymeals",
  authMiddleware,
  ensureCookRole,
  mealController.getMyMeals
);
router.post("/", authMiddleware, ensureCookRole, mealController.addMeal);
router.put("/:id", authMiddleware, ensureCookRole, mealController.updateMeal);
router.delete(
  "/:id",
  authMiddleware,
  ensureCookRole,
  mealController.deleteMeal
);

// //for cook
// router.post('/favorites/cooks/:id', authMiddleware, userController.addFavoriteCook);
//for meal
router.post(
  "/favorites/:id",
  authMiddleware,
  ensureCustomerRole,
  mealController.addFavoriteMeal
);
router.delete(
  "/favorites/:id",
  authMiddleware,
  ensureCustomerRole,
  mealController.removeFavoriteMeal
);
router.get(
  "/favorites",
  authMiddleware,
  ensureCustomerRole,
  mealController.getFavoriteMeals
);
router.patch('/updateMealStatusByAdmin', authMiddleware, ensureAdminRole, mealController.updateMealStatusByAdmin);
// Public
router.get("/", mealController.browseMeals);
router.get("/BestSellerMeal", mealController.getBestSellerMeal);
router.get("/random", mealController.getRandomMeals);
router.get("/:id", mealController.getMealById);

module.exports = router;
