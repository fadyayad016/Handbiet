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


exports.getAllUsersForAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sort by creation date
    const sortOrder = parseInt(req.query.sortOrder) || -1; // Default sort descending (-1)
    const role = req.query.role || null; // ?role=admin or ?role=customer
    const searchkeyword = req.query.searchkeyword || null; // ?searchkeyword=fady
    const userStatus = req.query.userStatus || null; // ?userStatus=active

    const userData = await adminDashboardService.getAllUsersForAdmin(page, limit, sortBy, sortOrder, role, searchkeyword, userStatus);

    res.status(200).json({
        message: 'All users fetched successfully for admin dashboard',
        ...userData, // Spreads the returned object (users array + pagination metadata)
    });
})


exports.updateUserForAdmin = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;
    const updatedUser = await adminDashboardService.updateUserForAdmin(userId, updateData);

    res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser,
    });
})

exports.deleteUserForAdmin = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    await adminDashboardService.deleteUserForAdmin(userId);

    res.status(200).json({
        message: 'User deleted successfully',
    });
});

