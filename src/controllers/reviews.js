const asyncHandler = require('express-async-handler');
const reviewService = require('../services/reviewsService');


exports.addReview = asyncHandler(async (req, res) => {
    const { rating, comment, orderId, mealId } = req.body; 

    const customerId = req.user.id; 

    const review = await reviewService.addReview(customerId, orderId, mealId, rating, comment);
    
    return res.status(201).json(review);
});


exports.getmealreviews = asyncHandler(async (req, res) => {
    const mealId = req.params.id; 

    const reviews = await reviewService.getMealReviews(mealId);
    
    return res.status(200).json(reviews);
});

exports.getBestCooks = asyncHandler(async (req, res) => {
    const bestCooks = await reviewService.getbestcooksDependingOnRating();
    
    return res.status(200).json({
        message: "Best cooks retrieved successfully",
        bestCooks: bestCooks
    });
} )  