const cartService = require('../services/cartService');

exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    console.log('req.user in addToCart:', req.user); // ✅

    const result = await cartService.addToCart(req.user, req.body); 
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const result = await cartService.updateCartItem(req.user, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const result = await cartService.removeFromCart(req.user, req.params.mealId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
