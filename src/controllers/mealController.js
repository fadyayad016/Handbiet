const mealService = require("../services/mealService");
const asyncHandler = require("express-async-handler");

exports.addMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.createMeal(req.user.id, req.body);
  res.status(201).json(meal);
});

exports.getMyMeals = asyncHandler(async (req, res) => {
  const meals = await mealService.getCookMeals(req.user.id);
  res.status(200).json(meals);
});

exports.updateMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.updateMeal(
    req.params.id,
    req.user.id,
    req.body
  );
  res.status(200).json(meal);
});

exports.deleteMeal = asyncHandler(async (req, res) => {
  const result = await mealService.deleteMeal(req.params.id, req.user.id);
  res.status(200).json(result);
});

exports.browseMeals = asyncHandler(async (req, res) => {
  const meals = await mealService.browseMeals(req.query);
  res.status(200).json(meals);
});

exports.addFavoriteMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.addFavoriteMeal(req.user.id, req.params.id);
  res.status(200).json(meal);
});

exports.removeFavoriteMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.removeFavoriteMeal(req.user.id, req.params.id);
  res.status(200).json(meal);
});
exports.getMealById = asyncHandler(async (req, res) => {
  const meal = await mealService.getMealById(req.params.id);
  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }
  res.status(200).json(meal);
});

exports.getFavoriteMeals = asyncHandler(async (req, res) => {
  const meals = await mealService.getFavoriteMeals(req.user.id);
  res.status(200).json(meals);
});
exports.getBestSellerMeal = asyncHandler(async (req, res) => {
  const meals = await mealService.getBestSellerMeal();
  res.status(200).json(meals);
});
