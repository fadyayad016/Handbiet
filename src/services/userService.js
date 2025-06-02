const User = require("../models/userAuth");
const mongoose = require("mongoose");

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password"); // No populate needed

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
    role: user.role,
    address: user.address,
    cookProfile: user.cookProfile,
    customerProfile: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const updateCurrentUser = async (userData) => {
  const { userId, ...updateData } = userData;
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  if (!updatedUser) {
    throw new Error("User not found");
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
    updatedAt: updatedUser.updatedAt,
  };
};

const getAllCooks = async () => {
  try {
    const cooks = await User.find({ role: "cook" }).select("-password").lean();
    return cooks; // Return the array directly
  } catch (error) {
    throw new Error("Error fetching cooks: " + error.message);
  }
};

const getCookById = async (id) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid cook ID");
    }

    const cook = await User.findOne({ _id: id, role: "cook" })
      .select("-password")
      .lean();

    if (!cook) {
      throw new Error("Cook not found");
    }

    return cook;
  } catch (error) {
    throw new Error("Error fetching cook: " + error.message);
  }
};

const getfavoriteCooks = async (customerId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new Error("Invalid customer ID");
    }

    const customer = await User.findOne({ _id: customerId, role: "customer" })
      .select("customerProfile.favorites")
      .populate({
        path: "customerProfile.favorites",
        match: { role: "cook" },
        select: "-password -customerProfile",
        populate: {
          path: "address cookProfile",
        },
      })
      .lean();

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer.customerProfile?.favorites || [];
  } catch (error) {
    throw new Error(error.message);
  }
};

// services/userService.js

const getFavoriteCooks = async (customerId) => {
  const customer = await User.findById(customerId).populate({
    path: "customerProfile.favorites",
    match: { role: "cook" },
    select: "firstName lastName profilePicture cookProfile address",
  });

  if (!customer || customer.role !== "customer") {
    throw new Error("Customer not found or invalid role");
  }
  if (!customer.customerProfile || !customer.customerProfile.favorites) {
    return []; // Return empty array if no favorites set yet
  }
  return customer.customerProfile.favorites;
};

const addFavoriteCook = async (customerId, cookId) => {
  const customer = await User.findById(customerId);
  if (!customer || customer.role !== "customer") {
    throw new Error("Customer not found or invalid role");
  }

  const cook = await User.findById(cookId);
  if (!cook || cook.role !== "cook") {
    throw new Error("Cook not found or invalid role");
  }

  if (!customer.customerProfile) {
    customer.customerProfile = { favorites: [] };
  }

  const alreadyFavorite = customer.customerProfile.favorites.includes(cookId);
  if (alreadyFavorite) {
    return { message: "Cook already in favorites" };
  }

  customer.customerProfile.favorites.push(cookId);
  await customer.save();

  return {
    message: "Cook added to favorites",
    favorites: customer.customerProfile.favorites,
  };
};

const removeFavoriteCook = async (customerId, cookId) => {
  const customer = await User.findById(customerId);
  if (!customer || customer.role !== "customer") {
    throw new Error("Customer not found or invalid role");
  }

  if (!customer.customerProfile || !customer.customerProfile.favorites) {
    throw new Error("No favorites list found");
  }

  const index = customer.customerProfile.favorites.indexOf(cookId);
  if (index === -1) {
    return { message: "Cook not in favorites" };
  }

  customer.customerProfile.favorites.splice(index, 1);
  await customer.save();

  return { message: "Cook removed from favorites" };
};

// const addCustomerAdress = async (userId, addressData) => {
//   const { mainAddress, additionalAddresses } = addressData;

//   const validateAddress = (address) => {
//     const requiredFields = ["street", "city", "state", "zipCode"];
//     for (const field of requiredFields) {
//       if (
//         !address[field] ||
//         typeof address[field] !== "string" ||
//         address[field].trim() === ""
//       ) {
//         throw new Error(`Invalid address data: Missing or empty ${field}`);
//       }
//     }
//   };

//   const user = await User.findById(userId);
//   if (!user) {
//     throw new Error("User not found");
//   }

//   // Set or update main address
//   if (mainAddress) {
//     validateAddress(mainAddress);
//     user.mainAddress = mainAddress;
//   }

//   // Add additional addresses if provided
//   if (Array.isArray(additionalAddresses)) {
//     for (const addr of additionalAddresses) {
//       validateAddress(addr);
//     }

//     if (!Array.isArray(user.addresses)) {
//       user.addresses = [];
//     }

//     user.addresses.push(...additionalAddresses);
//   }

//   await user.save();

//   return {
//     message: "Address added successfully",
//     mainAddress: user.mainAddress,
//     additionalAddresses: user.addresses,
//   };
// };

const addAddress = async (userId, addressData) => {
  const requiredFields = ["street", "city", "state", "zipCode", "phone"];
  for (const field of requiredFields) {
    if (
      !addressData[field] ||
      typeof addressData[field] !== "string" ||
      addressData[field].trim() === ""
    ) {
      throw new Error(`Invalid address data: Missing or empty ${field}`);
    }
  }
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.addresses = user.addresses || [];
  user.addresses.push(addressData);
  await user.save();
  return { message: "Address added successfully", addresses: user.addresses };
};

const getAllAddresses = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user.addresses || [];
};

const getAddressById = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const address = (user.addresses || []).find(
    (addr) => addr._id.toString() === addressId
  );
  if (!address) throw new Error("Address not found");
  return address;
};

const editAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const idx = (user.addresses || []).findIndex(
    (addr) => addr._id.toString() === addressId
  );
  if (idx === -1) throw new Error("Address not found");
  user.addresses[idx] = { ...user.addresses[idx]._doc, ...addressData };
  await user.save();
  return user.addresses[idx];
};

const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const idx = (user.addresses || []).findIndex(
    (addr) => addr._id.toString() === addressId
  );
  if (idx === -1) throw new Error("Address not found");
  user.addresses.splice(idx, 1);
  await user.save();
  return { message: "Address deleted successfully" };
};

const changeMainAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const address = (user.addresses || []).find(
    (addr) => addr._id.toString() === addressId
  );
  if (!address) throw new Error("Address not found");

  user.addresses = user.addresses.map((addr) => {
    if (addr._id.toString() === addressId) {
      return { ...addr._doc, isMain: true };
    }
    return { ...addr._doc, isMain: false };
  });
  user.mainAddress = address;

  await user.save();
  return {
    message: "Main address changed successfully",
    mainAddress: user.mainAddress,
  };
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getAllCooks,
  getCookById,
  getFavoriteCooks,
  addFavoriteCook,
  removeFavoriteCook,
  // addCustomerAdress,
  addAddress,
  getAllAddresses,
  getAddressById,
  editAddress,
  deleteAddress,
  changeMainAddress,
};
