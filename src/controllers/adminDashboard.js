const adminDashboardService = require('../services/adminDashboardService');
const asyncHandler = require('express-async-handler');



exports.getAllUsers = asyncHandler(async (req, res) => {
    const user = await adminDashboardService.getUsersStats(req.user);
    
    res.status(200).json({
        message: 'user is fetched successfully',
        user,
    });
    
})