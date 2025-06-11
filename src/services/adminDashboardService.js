const mongoose = require("mongoose");
const User = require("../models/userAuth");
const Order = require('../models/Order');
const CookProfile = require("../models/CookProfile");
const CustomerProfile = require("../models/CustomerProfile");



const getUsersStats = async () => {

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const totalUsers = await User.countDocuments();

  const usersLastMonth = await User.countDocuments({
    createdAt: {
      $gte: startOfLastMonth,
      $lte: endOfLastMonth,
    },
  });

  const usersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: startOfThisMonth,
    },
  });

  const increase =
    usersLastMonth === 0
      ? usersThisMonth > 0 ? 100 : 0
      : ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;

  return {
    totalUsers,
    usersThisMonth,
    usersLastMonth,
    increasePercentage: Math.round(increase * 100) / 100,
  };

};



const getOrdersStats = async () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month

  // Count total orders
  const totalOrders = await Order.countDocuments();

  // Count orders from last month
  const ordersLastMonth = await Order.countDocuments({
    createdAt: {
      $gte: startOfLastMonth,
      $lte: endOfLastMonth,
    },
  });

  // Count orders from this month
  const ordersThisMonth = await Order.countDocuments({
    createdAt: {
      $gte: startOfThisMonth,
    },
  });

  // Calculate percentage increase
  const increase =
    ordersLastMonth === 0
      ? ordersThisMonth > 0 ? 100 : 0
      : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

  return {
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    increasePercentage: Math.round(increase * 100) / 100,
  };
};



const getTotalRevenue = async () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const totalRevenueResult = await Order.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalPrice' }
      }
    }
  ]);
  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalAmount : 0;

  const revenueThisMonthResult = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startOfThisMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalPrice' }
      }
    }
  ]);
  const revenueThisMonth = revenueThisMonthResult.length > 0 ? revenueThisMonthResult[0].totalAmount : 0;

  const revenueLastMonthResult = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalPrice' }
      }
    }
  ]);
  const revenueLastMonth = revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].totalAmount : 0;

  const increase =
    revenueLastMonth === 0
      ? revenueThisMonth > 0 ? 100 : 0
      : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

  return {
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    increasePercentage: Math.round(increase * 100) / 100,
  };


};



const getAverageOrderValue = async () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month

  const calculateAOVForPeriod = async (startDate, endDate = now) => {
    const matchConditions = {
      status: 'completed',
      createdAt: { $gte: startDate }
    };
    if (endDate) {
      matchConditions.createdAt.$lte = endDate;
    }

    const periodTotalRevenueResult = await Order.aggregate([
      { $match: matchConditions },
      { $group: { _id: null, totalAmount: { $sum: '$totalPrice' } } }
    ]);
    const periodTotalRevenue = periodTotalRevenueResult.length > 0 ? periodTotalRevenueResult[0].totalAmount : 0;

    const periodCompletedOrdersCount = await Order.countDocuments(matchConditions);

    let periodAOV = 0;
    if (periodCompletedOrdersCount > 0) {
      periodAOV = periodTotalRevenue / periodCompletedOrdersCount;
    }
    return periodAOV;
  };

  const overallTotalRevenueResult = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, totalAmount: { $sum: '$totalPrice' } } }
  ]);
  const overallTotalRevenue = overallTotalRevenueResult.length > 0 ? overallTotalRevenueResult[0].totalAmount : 0;

  const overallCompletedOrdersCount = await Order.countDocuments({ status: 'completed' });

  let averageOrderValue = 0;
  if (overallCompletedOrdersCount > 0) {
    averageOrderValue = overallTotalRevenue / overallCompletedOrdersCount;
  }

  // 2. Calculate AOV for This Month
  const aovThisMonth = await calculateAOVForPeriod(startOfThisMonth);

  // 3. Calculate AOV for Last Month
  const aovLastMonth = await calculateAOVForPeriod(startOfLastMonth, endOfLastMonth);

  // 4. Calculate Percentage Increase
  let increasePercentage = 0;
  if (aovLastMonth === 0) {
    increasePercentage = aovThisMonth > 0 ? 100 : 0;
  } else {
    increasePercentage = ((aovThisMonth - aovLastMonth) / aovLastMonth) * 100;
  }

  return {
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    aovThisMonth: Math.round(aovThisMonth * 100) / 100,
    aovLastMonth: Math.round(aovLastMonth * 100) / 100,
    increasePercentage: Math.round(increasePercentage * 100) / 100,
    totalRevenue: overallTotalRevenue,
    completedOrdersCount: overallCompletedOrdersCount
  };
};


const getMonthlyRevenue = async (months = 6) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  startDate.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalMonthlyRevenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalMonthlyRevenue: { $round: ['$totalMonthlyRevenue', 2] }
      }
    }
  ]);


  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const filledMonthlyRevenue = [];
  let currentMonth = startDate.getMonth();
  let currentYear = startDate.getFullYear();

  for (let i = 0; i < months; i++) {
    const foundMonthData = monthlyRevenue.find(data =>
      data.year === currentYear && data.month === (currentMonth + 1)
    );

    filledMonthlyRevenue.push({
      year: currentYear,
      monthNumber: currentMonth + 1,
      monthName: monthNames[currentMonth],
      totalMonthlyRevenue: foundMonthData ? foundMonthData.totalMonthlyRevenue : 0
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }


  return filledMonthlyRevenue;

};

const getUserGrowth = async (months = 6) => { // months: Number of months to look back
  const now = new Date();
  // Calculate the start date for the aggregation, going back 'months' from the current month.
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  startDate.setHours(0, 0, 0, 0); // Set time to midnight for accurate day start

  const monthlyUserCount = await User.aggregate([
    {
      // Stage 1: Filter users created within the required date range
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      // Stage 2: Group users by registration year and month
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' } // $month returns month number (1-12)
        },
        newUsers: { $sum: 1 } // Count each user in the group
      }
    },
    {
      // Stage 3: Sort the results chronologically (from oldest to newest)
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    },
    {
      // Stage 4: Reshape the output data for easier frontend consumption
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        newUsers: 1
      }
    }
  ]);

  // Logic to fill in months with zero new users for complete data series
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const filledMonthlyUserCount = [];
  let currentMonth = startDate.getMonth(); // JavaScript's getMonth() returns 0-11
  let currentYear = startDate.getFullYear();

  for (let i = 0; i < months; i++) {
    const foundMonthData = monthlyUserCount.find(data =>
      data.year === currentYear && data.month === (currentMonth + 1) // Match with $month (1-12)
    );

    filledMonthlyUserCount.push({
      year: currentYear,
      monthNumber: currentMonth + 1,
      monthName: monthNames[currentMonth],
      newUsers: foundMonthData ? foundMonthData.newUsers : 0
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return filledMonthlyUserCount;


};

const getAllOrdersForAdmin = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1) => {
  const skip = (page - 1) * limit;

  // Count total orders for pagination info
  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({})
    .populate('customer', 'firstName lastName email') // Get customer's name and email
    .populate('cook', 'firstName lastName email')     // Get cook's name and email
    .sort({ [sortBy]: sortOrder }) // Sort by the specified field and order (-1 for descending, 1 for ascending)
    .skip(skip) // Skip documents for pagination
    .limit(limit); // Limit the number of documents per page

  return {
    orders,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit), // Calculate total pages
    limit,
  };

};
const getAllUsersForAdmin = async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1, role = null, searchkeyword = null, userStatus = null) => {
  const skip = (page - 1) * limit;

  let query = {};

  if (role) {
    if (["customer", "cook", "admin"].includes(role)) {
      query.role = role;
    } else {
      console.warn(`Invalid role provided: ${role}. Filtering by role will be ignored.`);
    }
  }

  if (userStatus && ["active", "suspended", "inactive"].includes(userStatus)) {
    query.status = userStatus;
  }

  if (searchkeyword) {
    const searchRegex = new RegExp(searchkeyword, 'i');
    query.$or = [
      { firstName: { $regex: searchRegex } },
      { lastName: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
    ];
  }

  const sortOptions = {};
  if (sortBy === 'lastLogin') {
    sortOptions.updatedAt = sortOrder;
  } else if (sortBy) {
    sortOptions[sortBy] = sortOrder;
  } else {
    sortOptions.createdAt = -1;
  }

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort(sortOptions)
    .lean();
  const usersWithOrderCount = await Promise.all(users.map(async (user) => {
    // Count orders where the user is either the customer or the cook
    const orderCount = await Order.countDocuments({
      $or: [
        { customer: user._id },
        { cook: user._id }
      ]
    });
    // Return the user object with the new orderCount property
    return { ...user, orderCount };
  }));

  const total = await User.countDocuments(query);

  return {
    users: usersWithOrderCount,

    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit),
  };

};



const updateUserForAdmin = async (userId, data) => {
  if (data.password) {
    delete data.password;
    console.warn("Attempted to update password directly via admin update. Ignoring password field.");
  }
  if (data.refreshToken) {
    delete data.refreshToken;
    console.warn("Attempted to update refresh token directly via admin update. Ignoring refresh token field.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-password, -refreshToken');

  if (!updatedUser) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  return updatedUser;


};

const deleteUserForAdmin = async (userId) => {
  const session = await User.startSession();
  session.startTransaction();

  const deletedUser = await User.findByIdAndDelete(userId, { session });

  if (!deletedUser) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // Clean up associated profiles (CookProfile, CustomerProfile)
  if (deletedUser.role === 'cook' && deletedUser.cookProfile) {
    await CookProfile.findByIdAndDelete(deletedUser.cookProfile, { session });
  }
  if (deletedUser.role === 'customer' && deletedUser.customerProfile) {
    await CustomerProfile.findByIdAndDelete(deletedUser.customerProfile, { session });
  }


  await Order.deleteMany({
    $or: [{ customer: userId }, { cook: userId }]
  }, { session });
  console.log(` Deleted all orders associated with user ${userId}.`);



  await session.commitTransaction();
  session.endSession();

  return deletedUser;

}

const ordermonitoring = async (status, searchQuery, startDate, endDate, page = 1, limit = 10) => {
  let query = {};

  // Filter by status if provided
  if (status) {
    query.status = status;
  }
  // Filter by date range if provided
  if (startDate || endDate) {
    query.createdAt = {}; // Orders are typically created at 'createdAt'
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set end date to the end of the day for inclusive filtering
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  // Search by customer name, phone, or custom order ID
  if (searchQuery) {
    // Find customer IDs matching the search query (name or phone)
    const User = mongoose.model('User');
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } }
      ]
    }).select('_id');

    const customerIds = users.map(user => user._id);

    query.$or = [];
    if (customerIds.length > 0) {
      query.$or.push({ customer: { $in: customerIds } });
    }


    query.$or.push({ orderCode: { $regex: searchQuery, $options: 'i' } });

    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
      query.$or.push({ _id: searchQuery });
    }

    if (query.$or.length === 0) {

      query.$or = [{ _id: null }];
    }
  }

  const skip = (page - 1) * limit;

  // Fetch orders, populate customer, cook, and meal details
  const orders = await Order.find(query)
    .populate({
      path: 'customer',
      select: 'name phone'
    })
    .populate({
      path: 'cook',
      select: 'name'
    })
    .populate({
      path: 'meals.meal',
      select: 'name price'
    })
    .sort({ createdAt: -1 }) // Sort by creation date, newest first
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(query);

  return {
    orders,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    limit,
  };
};


const getAdminOrderById = async (orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid Order ID format.');
    }

        // Find the order by its ID and populate all necessary related data
        const order = await Order.findById(orderId)
            .populate({
                path: 'customer',
                select: 'firstName lastName  email'
            })
            .populate({
                path: 'cook',
                select: 'firstName lastName email' 
            })
            .populate({
                path: 'meals.meal', 
                select: 'name price description mainImage'
               
            })
            .populate({
                path: 'paymentId', 
                select: 'amount status stripePaymentIntentId' 
            })
            .lean(); 
        if (!order) {
            return null; 
        }

        return order; 
   
};

module.exports = {
  getUsersStats,
  getOrdersStats,
  getTotalRevenue,
  getAverageOrderValue,
  getMonthlyRevenue,
  getUserGrowth,
  getAllOrdersForAdmin,
  getAllUsersForAdmin,
  updateUserForAdmin,
  deleteUserForAdmin,
  ordermonitoring,
  getAdminOrderById
};
