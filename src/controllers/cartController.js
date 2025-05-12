const cartService = require('../services/cartService');
const asyncHandler = require('express-async-handler');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user);
  res.status(200).json(cart);

});

exports.addToCart = asyncHandler(async (req, res) => {
  console.log('req.user in addToCart:', req.user);

  const result = await cartService.addToCart(req.user, req.body);
  res.status(200).json(result);

});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.updateCartItem(req.user, req.body);
  res.status(200).json(result);

});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.removeFromCart(req.user, req.params.mealId);
  res.status(200).json(result);

});
