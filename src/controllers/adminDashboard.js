const adminDashboardService = require('../services/adminDashboardService');
const asyncHandler = require('express-async-handler');



exports.getAllUsers = asyncHandler(async (req, res) => {
    const user = await adminDashboardService.getUsersStats();
    
    res.status(200).json({
        message: 'user is fetched successfully',
        user,
    });
    
})


exports.orderstates = asyncHandler(async (req, res) => {
    const orders = await adminDashboardService.getOrdersStats();
    
    res.status(200).json({
        message: 'orders are fetched successfully',
        orders,
    });
    
})


exports.totalrevenue = asyncHandler(async (req, res) => {
    const revenue = await adminDashboardService.getTotalRevenue();
    
    res.status(200).json({
        message: 'total revenue is fetched successfully',
        revenue,
    });
    
})

exports.averageOrderValue = asyncHandler(async (req, res) => {
    const averageOrderValue = await adminDashboardService.getAverageOrderValue();
    
    res.status(200).json({
        message: 'average order value is fetched successfully',
        averageOrderValue,
    });
    
})

exports.MonthlyRevenue = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months) || 6; 

    const monthlyRevenueData = await adminDashboardService.getMonthlyRevenue(months);
    
    res.status(200).json({
        message: `Monthly revenue for the last ${months} months fetched successfully`,
        data: monthlyRevenueData,
    });
    
})

exports.UserGrowth = asyncHandler(async (req, res) => {
    const months = parseInt(req.query.months) || 6; 

    const monthlyUserGrowthData = await adminDashboardService.getUserGrowth(months);
    
    res.status(200).json({
        message: `Monthly User Growth for the last ${months} months fetched successfully`,
        data: monthlyUserGrowthData,
    });
    
})



exports.getAllOrders = asyncHandler(async (req, res) => {
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sort by creation date
    const sortOrder = parseInt(req.query.sortOrder) || -1; // Default sort descending (-1)

    const orderData = await adminDashboardService.getAllOrdersForAdmin(page, limit, sortBy, sortOrder);

    res.status(200).json({
        message: 'All orders fetched successfully for admin dashboard',
        ...orderData, // Spreads the returned object (orders array + pagination metadata)
    });
});


