const mongoose = require("mongoose");
const User = require("../models/userAuth");    




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


module.exports = {
  getUsersStats,
}