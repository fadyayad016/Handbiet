const User = require('../models/userAuth'); 


const getCurrentUser = async (userId) => {
  
    const user = await User.findById(userId).select('-password'); // No populate needed
  
    if (!user) {
      throw new Error('User not found');
    }
  
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      role: user.role,
      address: user.address,
      cookProfile: user.role,
      customerProfile: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  };

const updateCurrentUser = async (userData) => {
  const { userId, ...updateData } = userData;
  const updatedUser = await User.findByIdAndUpdate( userId, updateData, { new: true }).select('-password'); 
  if (!updatedUser) {
    throw new Error('User not found');
  } 
  return {
    id: updatedUser._id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    profilePicture: updatedUser.profilePicture,
    role: updatedUser.role,
    address: updatedUser.address,
    cookProfile: updatedUser.role,
    customerProfile: updatedUser.role,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };  

 }



  module.exports = { getCurrentUser , updateCurrentUser};
