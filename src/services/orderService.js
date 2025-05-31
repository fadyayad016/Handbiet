const Order = require('../models/Order');
const Meal = require('../models/Meal');
const mongoose = require('mongoose');


const createOrder = async (user, data) => {
  const { meals, deliveryAddress } = data;

  if (!meals?.length || !deliveryAddress) {
    throw new Error("Invalid order data");
  }

  // Fetch meal details to get their cooks
  const mealDocs = await Meal.find({ _id: { $in: meals.map(m => m.mealId) } });

  // Map meals to include cookId and quantity
  const mealsWithCook = meals.map(item => {
    const mealDoc = mealDocs.find(m => m._id.toString() === item.mealId);
    if (!mealDoc) throw new Error(`Meal not found: ${item.mealId}`);

    return {
      mealId: item.mealId,
      quantity: item.quantity,
      cookId: mealDoc.cook,
      price: mealDoc.price,
    };
  });

  // Group meals by cook
  const mealsByCook = {};
  for (const item of mealsWithCook) {
    if (!mealsByCook[item.cookId]) {
      mealsByCook[item.cookId] = [];
    }
    mealsByCook[item.cookId].push(item);
  }

  const createdOrders = [];

  // Create one order per cook
  for (const [cookId, items] of Object.entries(mealsByCook)) {
    const orderItems = items.map(i => ({
      meal: new mongoose.Types.ObjectId(i.mealId),
      quantity: i.quantity
    }));

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder = new Order({
      customer: user.id,
      cook: cookId,
      meals: orderItems,
      deliveryAddress,
      totalPrice,
      status: 'pending',
    });

    await newOrder.save();

    // Update meal sales count
    for (const item of items) {
      await Meal.findByIdAndUpdate(item.mealId, {
        $inc: { salesCount: item.quantity }
      });
    }

    createdOrders.push(newOrder);
  }

  return createdOrders;
};


const getOrders = async (user) => {
  const orders = await Order.find({ customer: user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'meals.meal',
      select: 'name price mainImage'
    })
    .populate({
      path: 'cook',
      select: 'firstName lastName profilePicture'
    });

  const formattedOrders = orders.map(order => ({
    id: order._id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    cook: order.cook ? {
      id: order.cook._id,
      name: `${order.cook.firstName} ${order.cook.lastName}`,
      // profilePicture: order.cook.profilePicture
    } : null,
    meals: order.meals.map(item => ({
      id: item.meal?._id,
      name: item.meal?.name,
      price: item.meal?.price,
      mainImage: item.meal?.mainImage,
      quantity: item.quantity,
      subtotal: item.meal ? (item.meal.price * item.quantity).toFixed(2) : 0
    })),
    deliveryAddress: order.deliveryAddress
  }));

  return formattedOrders;
};

const getOrderByCookId = async (cookIdObject) => {
  const cookId = cookIdObject.id;

  const orders = await Order.find({
    'meals.meal': { $exists: true } //  to ensure meal exists
  })
    .populate('customer', 'firstName lastName')
    .populate({
      path: 'meals.meal',
      match: { cook: cookId },
      select: '_id cook'
    });


  const filteredOrders = orders.filter(order =>
    order.meals.some(item => item.meal !== null)
  );

  const result = filteredOrders.map(order => ({
    _id: order._id,
    customer: {
      _id: order.customer?._id,
      firstName: order.customer?.firstName || '',
      lastName: order.customer?.lastName || ''
    },
    meals: order.meals
      .filter(item => item.meal !== null)
      .map(item => ({
        meal: item.meal._id,
        quantity: item.quantity,
        _id: item._id
      })),
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    __v: order.__v
  }));

  return result;
};




module.exports = { createOrder, getOrders, getOrderByCookId };


