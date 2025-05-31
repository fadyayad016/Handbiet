const userService = require("../services/userService");
const asyncHandler = require("express-async-handler");

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  res.status(200).json({
    message: "User retrieved successfully",
    data: user,
  });
});

exports.updateCurrentUser = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateCurrentUser({
    ...req.body,
    userId: req.user.id,
  });
  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
});

exports.listAllCooks = asyncHandler(async (req, res) => {
  const cooks = await userService.getAllCooks();
  res.status(200).json({
    message: "Cooks retrieved successfully",
    data: cooks,
  });
});

exports.getCookById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cook = await userService.getCookById(id);
  res.status(200).json({
    message: "Cook retrieved successfully",
    data: cook,
  });
});

exports.getFavoriteCooks = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const favoriteCooks = await userService.getFavoriteCooks(customerId);
  res.status(200).json({
    message: "FavoriteCooks retrieved successfully",
    data: favoriteCooks,
  });
});

exports.addFavoriteCook = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const cookId = req.params.cookId;

  const result = await userService.addFavoriteCook(customerId, cookId);

  res.status(200).json(result);
});

exports.removeFavoriteCook = asyncHandler(async (req, res) => {
  const customerId = req.user.id || req.user._id;
  const cookId = req.params.cookId;

  const result = await userService.removeFavoriteCook(customerId, cookId);
  res.status(200).json({ message: "Cook removed from favorites", ...result });
});

// exports.addCustomerAdress = asyncHandler(async (req, res) => {
//   const result = await userService.addCustomerAdress(req.user.id, req.body);
//   res.status(200).json(result);
// });

exports.addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressData = req.body;
  console.log(addressData);
  const result = await userService.addAddress(userId, addressData);
  res.status(201).json(result);
});

exports.getAllAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addresses = await userService.getAllAddresses(userId);
  res.status(200).json(addresses);
});

exports.getAddressById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.addressId;
  const address = await userService.getAddressById(userId, addressId);
  res.status(200).json(address);
});

exports.editAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.addressId;
  const addressData = req.body;
  const address = await userService.editAddress(userId, addressId, addressData);
  res.status(200).json(address);
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.addressId;
  const result = await userService.deleteAddress(userId, addressId);
  res.status(200).json(result);
});

exports.changeMainAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.addressId;
  const result = await userService.changeMainAddress(userId, addressId);
  res.status(200).json(result);
});
