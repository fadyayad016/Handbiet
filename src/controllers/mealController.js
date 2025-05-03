const mealService = require('../services/mealService');

exports.addMeal = async (req, res) => {
  try {
    const meal = await mealService.createMeal(req.user.id, req.body);
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyMeals = async (req, res) => {
  try {
    const meals = await mealService.getCookMeals(req.user.id);
    res.status(200).json(meals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const meal = await mealService.updateMeal(req.params.id, req.user.id, req.body);
    res.status(200).json(meal);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const result = await mealService.deleteMeal(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.browseMeals = async (req, res) => {
  try {
    const meals = await mealService.browseMeals(req.query);
    res.status(200).json(meals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.addFavoriteMeal = async (req, res) => {
  try {
    const meal = await mealService.addFavoriteMeal(req.user.id, req.params.id);
    res.status(200).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

exports.removeFavoriteMeal = async (req, res) => {
  try {
    const meal = await mealService.removeFavoriteMeal(req.user.id, req.params.id);
    res.status(200).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}