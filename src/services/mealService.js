const Meal = require("../models/Meal");
const User = require("../models/userAuth");
const Notification = require("../models/Notification");

const mongoose = require("mongoose");

const createMeal = async (cookId, data) => {
  const meal = new Meal({
    ...data,
    cook: cookId,
    mainImage: data.mainImage,
    images: data.images || [],
  });
  await meal.save();
  const admins = await User.find({ role: "admin" });
  const cook = await User.findById(cookId);
  for (const admin of admins) {
    const notificationMessage = `A new meal "${meal.name}" by ${cook.firstName} ${cook.lastName} is awaiting your approval.`;

    await Notification.create({
      user: admin._id,
      sender: cookId,
      meal: meal._id,
      type: "meal_pending",
      message: notificationMessage,
    });
    const io = require('../index').app.get('io');
    const connectedUsers = require('../index').app.get('connectedUsers');
    const adminSocketId = connectedUsers.get(admin._id.toString());
    if (adminSocketId) {
      io.to(adminSocketId).emit("new_meal_pending", { // Event for admins to listen to
        message: notificationMessage,
        mealId: meal._id,
        mealName: meal.name,
        cookName: `${cook.firstName} ${cook.lastName}`,
      });
      console.log(`New meal pending notification sent to admin ${admin._id} via Socket.IO`);
    } else {
      console.log(`Admin ${admin._id} is not currently connected via Socket.IO.`);
    }
  }
  return meal;
};

const getCookMeals = async (cookId) => {
  return await Meal.find({ cook: cookId });
};

const updateMeal = async (id, cookId, data) => {
  const existingMeal = await Meal.findOne({ _id: id, cook: cookId });

  if (!existingMeal) {
    throw new Error("Meal not found or unauthorized");
  }

  let shouldNotifyAdminsForReapproval = false; 

  if (existingMeal.status === "approved" || existingMeal.status === "rejected") {
    data.status = "pending"; 
    shouldNotifyAdminsForReapproval = true;
  }

  const updatedMeal = await Meal.findOneAndUpdate(
    { _id: id, cook: cookId },
    data,
    { new: true }
  );

  if (!updatedMeal) {
    throw new Error("Meal update failed");
  }

  if (shouldNotifyAdminsForReapproval && updatedMeal.status === "pending") {
    const admins = await User.find({ role: "admin" });
    const cook = await User.findById(cookId);

    const cookName = cook ? `${cook.firstName} ${cook.lastName}` : "An unknown cook";
    const notificationMessage = `The meal "${updatedMeal.name}" by ${cookName} has been updated and is now awaiting your re-approval.`;

    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        sender: cookId,
        meal: updatedMeal._id,
        type: "meal_pending", 
        message: notificationMessage,
      });

      const io = require('../index').app.get('io');
      const connectedUsers = require('../index').app.get('connectedUsers');
      const adminSocketId = connectedUsers.get(admin._id.toString());

      if (adminSocketId) {
        io.to(adminSocketId).emit("new_meal_pending", {
          message: notificationMessage,
          mealId: updatedMeal._id,
          mealName: updatedMeal.name,
          cookName: cookName,
        });
        console.log(`Meal update (re-approval) notification sent to admin ${admin._id} via Socket.IO`);
      } else {
        console.log(`Admin ${admin._id} is not currently connected via Socket.IO.`);
      }
    }
  }

  return updatedMeal;
};

const deleteMeal = async (id, cookId) => {
  const meal = await Meal.findOneAndDelete({ _id: id, cook: cookId });
  if (!meal) throw new Error("Meal not found or unauthorized");
  return { message: "Meal deleted" };
};

const browseMeals = async (filters) => {
  const query = {};
  if (filters.cuisineType) query.cuisineType = filters.cuisineType;
  if (filters.maxPrice) query.price = { $lte: filters.maxPrice };

  if (filters.availableDay) {
    query["availability.days"] = filters.availableDay;
  }
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  return await Meal.find(query).populate(
    "cook",
    "firstName lastName profilePicture"
  );
};

const getMealById = async (id) => {
  return await Meal.findById(id).populate(
    "cook",
    "firstName lastName profilePicture"
  );
};

const addFavoriteMeal = async (customerId, mealId) => {
  const customer = await User.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  // Ensure nested objects exist
  if (!customer.customerProfile) {
    customer.customerProfile = { favorites: { meals: [], cooks: [] } };
  }

  if (!customer.customerProfile.favorites) {
    customer.customerProfile.favorites = { meals: [], cooks: [] };
  }

  if (!customer.customerProfile.favorites.meals) {
    customer.customerProfile.favorites.meals = [];
  }

  // Prevent duplicate favorite meals
  const alreadyFavorited =
    customer.customerProfile.favorites.meals.includes(mealId);
  if (alreadyFavorited) {
    return { message: "Meal already in favorites", mealId };
  }

  customer.customerProfile.favorites.meals.push(mealId);
  await customer.save();

  return {
    message: "Meal added to favorites",
    mealId,
  };
};

const removeFavoriteMeal = async (customerId, mealId) => {
  const customer = await User.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  const favorites = customer.customerProfile?.favorites?.meals;
  if (!favorites) {
    return { message: "No favorite meals found", mealId };
  }

  const mealObjectId = new mongoose.Types.ObjectId(mealId);
  const index = favorites.findIndex((id) => id.equals(mealObjectId));

  if (index === -1) {
    return { message: "Meal not found in favorites", mealId };
  }

  favorites.splice(index, 1);
  await customer.save();

  return {
    message: "Meal removed from favorites",
    mealId,
  };
};

const getFavoriteMeals = async (customerId) => {
  const customer = await User.findById(customerId).lean();
  if (
    !customer ||
    !customer.customerProfile ||
    !customer.customerProfile.favorites ||
    !customer.customerProfile.favorites.meals
  ) {
    return [];
  }
  // Populate favorite meals
  return await Meal.find({
    _id: { $in: customer.customerProfile.favorites.meals },
  }).populate("cook", "firstName lastName profilePicture");
};
const getBestSellerMeal = async () => {
  const bestmeal = await Meal.find()
    .sort({ salesCount: -1 })
    .populate("cook", "firstName lastName profilePicture")
    .limit(5);
  return bestmeal;
};

const getRandomMeal = async (takeNumber = 1) => {
  const totalMeals = await Meal.countDocuments();
  if (totalMeals === 0) {
    throw new Error("No meals found");
  }

  const limit = Math.min(takeNumber, totalMeals);

  const randomMeals = await Meal.aggregate([{ $sample: { size: limit } }]);

  return randomMeals;
};



const updateMealStatusByAdmin = async (mealId, action, adminId, rejectionReason) => {
  if (!["approved", "rejected"].includes(action)) {
    throw new Error("Invalid action.  Must be 'approved' or 'rejected'.");
  }

  const meal = await Meal.findById(mealId).populate('cook', 'firstName lastName');

  if (!meal) {
    throw new Error("Meal not found.");
  }

  if (meal.status === action) {
    throw new Error(`Meal is already ${action}.`); // Prevent redundant updates
  }

  meal.status = action;
  await meal.save();

  const cookId = meal.cook._id; // Access the cook's _id from the populated object
  const admin = await User.findById(adminId);
  if (!admin) {
    console.warn(`Admin with ID ${adminId} not found for notification.`);
  }
  const adminName = admin ? `${admin.firstName} ${admin.lastName}` : "An admin";

  let notificationMessage = `Your meal "${meal.name}" has been ${action} by ${adminName}.`;
  if (action === "rejected" && rejectionReason) {
    notificationMessage += ` Reason: ${rejectionReason}`;
  }

  await Notification.create({
    user: cookId,
    sender: adminId,
    meal: mealId,
    type: `meal_${action}`,
    message: notificationMessage,
  });

  const io = require('../index').app.get('io');
  const connectedUsers = require('../index').app.get('connectedUsers');
  const cookSocketId = connectedUsers.get(cookId.toString());

  if (cookSocketId) {
    io.to(cookSocketId).emit(`meal_${action}_notification`, { // Event for cook to listen to
      message: notificationMessage,
      mealId: meal._id,
      mealName: meal.name,
      status: action,
    });
    console.log(`Meal ${action} notification sent to cook ${cookId} via Socket.IO`);
  } else {
    console.log(`Cook ${cookId} is not currently connected via Socket.IO.`);
  }


  return meal;
};

module.exports = {
  createMeal,
  getCookMeals,
  updateMeal,
  deleteMeal,
  browseMeals,
  addFavoriteMeal,
  removeFavoriteMeal,
  getMealById,
  getFavoriteMeals,
  getBestSellerMeal,
  getRandomMeal,
  updateMealStatusByAdmin
};
