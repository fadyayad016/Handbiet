const Meal = require('../models/Meal');

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
  if (filters.availableDay) query['availability.days'] = filters.availableDay;

  return await Meal.find(query).populate('cook', 'firstName lastName profilePicture');
};


module.exports = {createMeal,getCookMeals,updateMeal,deleteMeal,browseMeals};





  
