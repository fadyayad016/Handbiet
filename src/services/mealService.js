const Meal = require('../models/Meal');
const User = require('../models/userAuth');
const mongoose = require('mongoose');

const createMeal = async (cookId, data) => {
  const meal = new Meal({ ...data, cook: cookId });
  await meal.save();
  return meal;
};

const getCookMeals = async (cookId) => {
  return await Meal.find({ cook: cookId });
};

const updateMeal = async (id, cookId, data) => {
  const meal = await Meal.findOneAndUpdate(
    { _id: id, cook: cookId },
    data,
    { new: true }
  );
  if (!meal) throw new Error('Meal not found or unauthorized');
  return meal;
};

const deleteMeal = async (id, cookId) => {
  const meal = await Meal.findOneAndDelete({ _id: id, cook: cookId });
  if (!meal) throw new Error('Meal not found or unauthorized');
  return { message: 'Meal deleted' };
};

const browseMeals = async (filters) => {
  const query = {};
  if (filters.cuisineType) query.cuisineType = filters.cuisineType;
  if (filters.maxPrice) query.price = { $lte: filters.maxPrice };

  if (filters.availableDay) {
    query['availability.days'] = filters.availableDay;
  }
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  return await Meal.find(query).populate('cook', 'firstName lastName profilePicture');
};


const addFavoriteMeal = async (customerId, mealId) => {
  const customer = await User.findById(customerId);
  if (!customer) throw new Error('Customer not found');

  // Ensure nested objects exist
  if (!customer.customerProfile) {
    customer.customerProfile = { favorites: { meals: [], cooks: [] } };
  }

  if (!customer.customerProfile.favorites) {
    customer.customerProfile.favorites = { meals: [], cooks: [] };
  }

  if (!customer.customerProfile.favorites.meals) {
    customer.customerProfile.favorites.meals = [];
  }

  // Prevent duplicate favorite meals
  const alreadyFavorited = customer.customerProfile.favorites.meals.includes(mealId);
  if (alreadyFavorited) {
    return { message: 'Meal already in favorites', mealId };
  }

  customer.customerProfile.favorites.meals.push(mealId);
  await customer.save();

  return {
    message: 'Meal added to favorites',
    mealId
  };
};


const removeFavoriteMeal = async (customerId, mealId) => {
  const customer = await User.findById(customerId);
  if (!customer) throw new Error('Customer not found');

  const favorites = customer.customerProfile?.favorites?.meals;
  if (!favorites) {
    return { message: 'No favorite meals found', mealId };
  }

  const mealObjectId = new mongoose.Types.ObjectId(mealId);
  const index = favorites.findIndex(id => id.equals(mealObjectId));

  if (index === -1) {
    return { message: 'Meal not found in favorites', mealId };
  }

  favorites.splice(index, 1);
  await customer.save();

  return {
    message: 'Meal removed from favorites',
    mealId
  };
};

const getBestSellerMeal = async () => {
  const bestmeal = await Meal.findOne()
    .sort({ salesCount: -1 })
    .populate('cook', 'firstName lastName profilePicture')
    .limit(1);
  return bestmeal;

}


module.exports = { createMeal, getCookMeals, updateMeal, deleteMeal, browseMeals, addFavoriteMeal, removeFavoriteMeal, getBestSellerMeal };






