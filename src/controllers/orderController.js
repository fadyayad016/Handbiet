const orderService = require('../services/orderService');
const asyncHandler = require('express-async-handler');





exports.createOrder = asyncHandler(async (req, res) => {

    const newOrder = await orderService.createOrder(req.user, req.body);

    res.status(201).json({
        message: 'Order created successfully',
        order: newOrder,
    });

});


exports.getOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getOrders(req.user);

    res.status(200).json({
        message: 'Orders fetched successfully',
        orders,
    });

});

exports.getOrderByCookId = asyncHandler(async (req, res) => {
    const orders = await orderService.getOrderByCookId(req.user);

    res.status(200).json({
        message: 'Orders for cook fetched successfully',
        orders,
    });

})

