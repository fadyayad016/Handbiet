const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Meal = require("../models/Meal");
const User = require("../models/userAuth");

const addReview = async (customerId, mealId, rating, comment) => {
  // 1. Find a completed order for this customer that contains the meal
  console.log(customerId, mealId);
  const order = await Order.findOne({
    customer: customerId,
    status: "completed",
    "meals.meal": mealId,
  }).populate("meals.meal");

  if (!order) {
    throw new Error(
      "You can only review meals you have purchased and completed an order for."
    );
  }

  // 2. Ensure the cook exists from the order
  const cookId = order.cook;
  if (!cookId) {
    throw new Error("Cook information not found for this order.");
  }

  // 3. Check if a review already exists for this meal by this customer
  const existingReview = await Review.findOne({
    meal: mealId,
    customer: customerId,
  });
  if (existingReview) {
    throw new Error("You have already reviewed this meal.");
  }

  // 4. Create the new review
  const review = new Review({
    order: order._id,
    meal: mealId,
    cook: cookId,
    customer: customerId,
    rating: rating,
    comment: comment,
  });
  await review.save();

  // 5. Update the Meal's rating
  const meal = await Meal.findById(mealId);
  if (meal) {
    meal.reviews.push(review._id);
    const mealReviews = await Review.find({ meal: mealId });
    const totalRating = mealReviews.reduce((sum, r) => sum + r.rating, 0);
    meal.rating = mealReviews.length > 0 ? totalRating / mealReviews.length : 0;
    await meal.save();
  }

  // 6. Update the Cook's average rating and total reviews
  const cookUser = await User.findById(cookId);
  if (cookUser && cookUser.cookProfile) {
    const cookReviews = await Review.find({ cook: cookId });
    const totalCookRating = cookReviews.reduce((sum, r) => sum + r.rating, 0);
    cookUser.cookProfile.totalReviews = cookReviews.length;
    cookUser.cookProfile.averageRating =
      cookReviews.length > 0 ? totalCookRating / cookReviews.length : 0;
    await cookUser.save();
  }

  return review;
};

const getMealReviews = async (mealId) => {
  const reviews = await Review.find({ meal: mealId })
    .populate("customer", "firstName lastName profilePicture")
    .populate("cook", "firstName lastName profilePicture")
    .sort({ createdAt: -1 }); // Sort by most recent first
  return reviews;
};

const getbestcooksDependingOnRating = async () => {
  const cookRatings = await Review.aggregate([
    {
      $group: {
        _id: "$cook",
        averageRating: { $avg: "$rating" }, // Calculate average rating
        totalReviews: { $sum: 1 }, // Count total reviews
      },
    },
    {
      // Filter out cooks who don't meet the 4.5 rating threshold
      $match: {
        averageRating: { $gte: 4.5 },
      },
    },
    {
      $sort: {
        averageRating: -1,
        totalReviews: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);

  // If no cooks meet the criteria, return an empty array
  if (cookRatings.length === 0) {
    return [];
  }

  // Extract the IDs of the top 10 cooks from the aggregation result
  const topCookIds = cookRatings.map((cook) => cook._id);

  const topCooks = await User.find({
    _id: { $in: topCookIds },
    role: "cook",
  })
    .select("-password -refreshToken")
    .lean();

  const orderedCooks = topCookIds
    .map((id) => topCooks.find((cook) => cook._id.equals(id)))
    .filter(Boolean); // Filter out any potential nulls if a cook wasn't found (unlikely here)

  const finalCooks = orderedCooks.map((cook) => {
    const ratingData = cookRatings.find((cr) => cr._id.equals(cook._id));
    return {
      ...cook,
      cookProfile: {
        ...cook.cookProfile,
        averageRating: ratingData ? ratingData.averageRating : 0,
        totalReviews: ratingData ? ratingData.totalReviews : 0,
      },
    };
  });

  return finalCooks;
};

module.exports = {
  addReview,
  getMealReviews,
  getbestcooksDependingOnRating,
};
