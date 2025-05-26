const Order = require('../models/Order');
const Meal = require('../models/Meal');
const mongoose = require('mongoose');



const createOrder = async (user, data) => {
    console.log('Creating order for user:', user); // Debugging line

const { meals, deliveryAddress } = data;

if (!meals?.length || !deliveryAddress) {
    throw new Error("Invalid order data");
}

    // Check for an existing open order (optional logic, can be skipped or altered)
    let existingOrder = await Order.findOne({ customer: user.id, status: 'pending' });
    if (existingOrder) {
        throw new Error("You already have a pending order");
    }

    // Prepare order items
    const orderItems = meals.map(item => ({
        meal: new mongoose.Types.ObjectId(item.mealId),
        quantity: item.quantity
    }));

    // Create order
    const newOrder = new Order({
        customer: user.id,
        meals: orderItems,
        deliveryAddress,
        status: 'pending',
    });

    await newOrder.save();
     for (const item of orderItems) {
        await Meal.findByIdAndUpdate(item.meal, {
            $inc: { salesCount: item.quantity }
        });
    }
    return newOrder;
};

const getOrders = async (user) => {

    // Fetch orders for the customer
    const orders = await Order.find({ customer: user.id }).populate('meals.meal').populate('cook');
    return orders;
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




module.exports = { createOrder, getOrders, getOrderByCookId};


