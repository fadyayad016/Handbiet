const Cart = require("../models/cart");
const mongoose = require("mongoose");

const getCart = async (user) => {
  try {
    let cart = await Cart.findOne({ customer: user.id }).populate("items.meal");
    if (!cart) {
      cart = await Cart.create({ customer: user.id, items: [] });
    }
    return cart;
  } catch (err) {
    throw new Error("Error fetching cart: " + err.message);
  }
};

const addToCart = async (user, data) => {
  console.log("user received in addToCart:", user);

  const mealObjectId = new mongoose.Types.ObjectId(data.mealId);
  let cart = await Cart.findOne({ customer: user.id });

  if (!cart) {
    cart = await Cart.create({
      customer: user.id,
      items: [{ meal: mealObjectId, quantity: data.quantity }],
    });
  } else {
    const existingItem = cart.items.find((item) =>
      item.meal.equals(mealObjectId)
    );
    if (existingItem) {
      existingItem.quantity += data.quantity;
    } else {
      cart.items.push({ meal: mealObjectId, quantity: data.quantity });
    }
    await cart.save();
  }

  return {
    message: "Item added to cart",
    cart,
  };
};

const updateCartItem = async (user, data) => {
  const mealObjectId = new mongoose.Types.ObjectId(data.mealId);
  const cart = await Cart.findOne({ customer: user.id });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find((item) => item.meal.equals(mealObjectId));
  if (!item) {
    throw new Error("Item not found in cart");
  }

  item.quantity = data.quantity;
  await cart.save();

  return {
    message: "Item updated in cart",
    cart,
  };
};

const removeFromCart = async (user, mealId) => {
  if (!mealId || !mongoose.Types.ObjectId.isValid(mealId)) {
    throw new Error("Invalid mealId");
  }
  const mealObjectId = new mongoose.Types.ObjectId(mealId);
  const cart = await Cart.findOne({ customer: user.id });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((item) =>
    item.meal.equals(mealObjectId)
  );
  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return {
    message: "Item removed from cart",
    cart,
  };
};

const clearCart = async (user) => {
  const cart = await Cart.findOne({ customer: user.id });
  if (!cart) {
    throw new Error("Cart not found");
  }
  cart.items = [];
  await cart.save();
  return {
    message: "All items removed from cart",
    cart,
  };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
