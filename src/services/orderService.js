const Order = require('../models/Order');
const mongoose = require('mongoose');



const createOrder = async (user, data) => {
    console.log('Creating order for user:', user); // Debugging line

    const { cookId, meals, deliveryAddress } = data;

    // Validate input
    if (!cookId || !meals?.length || !deliveryAddress) {
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
        cook: new mongoose.Types.ObjectId(cookId),
        meals: orderItems,
        deliveryAddress,
        status: 'pending',
    });

    await newOrder.save();
    return newOrder;
};

const getOrders = async (user) => {

    // Fetch orders for the customer
    const orders = await Order.find({ customer: user.id }).populate('meals.meal').populate('cook');
    return orders;
};


module.exports = { createOrder, getOrders };


