const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Meal = require("../models/Meal");
const mongoose = require("mongoose");

const createOrder = async (user, data) => {
  const { meals, deliveryAddress } = data;

  if (!meals?.length || !deliveryAddress) {
    throw new Error(
      "Invalid order data: Missing meals, delivery address, or delivery method."
    );
  }

  const mealDocs = await Meal.find({
    _id: { $in: meals.map((m) => m.mealId) },
  });

  const mealsWithCook = meals.map((item) => {
    const mealDoc = mealDocs.find((m) => m._id.toString() === item.mealId);
    if (!mealDoc) throw new Error(`Meal not found: ${item.mealId}`);
    return {
      mealId: item.mealId,
      quantity: item.quantity,
      cookId: mealDoc.cook,
      price: mealDoc.price,
    };
  });

  const mealsByCook = {};
  for (const item of mealsWithCook) {
    if (!mealsByCook[item.cookId]) {
      mealsByCook[item.cookId] = [];
    }
    mealsByCook[item.cookId].push(item);
  }

  const createdOrders = [];
  let grandTotalPrice = 0;

  for (const [cookId, items] of Object.entries(mealsByCook)) {
    const orderItems = items.map((i) => ({
      meal: new mongoose.Types.ObjectId(i.mealId),
      quantity: i.quantity,
    }));

    const totalPriceForThisOrder = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    grandTotalPrice += totalPriceForThisOrder;
    //Generate a unique orderCode
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const orderCode = `HB-${datePart}-${randomPart}`; // Example: HB-20250611-1234

    const newOrder = new Order({
      customer: user.id,
      cook: cookId,
      meals: orderItems,
      deliveryAddress,
      totalPrice: totalPriceForThisOrder,
      status: "pending",
      orderCode: orderCode,
    });

    await newOrder.save();

    for (const item of items) {
      await Meal.findByIdAndUpdate(item.mealId, {
        $inc: { salesCount: item.quantity },
      });
    }
    const customerName = `${user.firstName} ${user.lastName}`;
    const notificationMessage = `You have received a new order from ${customerName}.`;

    await Notification.create({
      user: cookId,
      order: newOrder._id,
      message: notificationMessage,
    });
    const io = require("../index").app.get("io");
    const connectedUsers = require("../index").app.get("connectedUsers");

    const cookSocketId = connectedUsers.get(cookId.toString());
    if (cookSocketId) {
      io.to(cookSocketId).emit("newOrderNotification", {
        // This is the event name
        message: notificationMessage,
        orderId: newOrder._id,
        status: newOrder.status,
        customerName: customerName,
        totalPrice: newOrder.totalPrice,
        orderCode: newOrder.orderCode,
      });
      console.log(
        `New order notification sent to cook ${cookId} via Socket.IO`
      );
    } else {
      console.log(`Cook ${cookId} is not currently connected via Socket.IO.`);
    }
    createdOrders.push(newOrder);
  }

  return { createdOrders, grandTotalPrice };
};

const createPaymentIntentForOrders = async (userId, orderDetails) => {
  const { createdOrders, grandTotalPrice } = orderDetails;

  if (!createdOrders || createdOrders.length === 0 || grandTotalPrice <= 0) {
    throw new Error("No orders or invalid total amount for payment.");
  }

  const orderIds = createdOrders.map((order) => order._id);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(grandTotalPrice * 100),
    currency: "egp",
    metadata: {
      userId: userId.toString(),
      order_ids: JSON.stringify(orderIds),
    },
  });

  const newPaymentRecord = new Payment({
    orderIds: orderIds,
    customer: userId.id,
    stripePaymentIntentId: paymentIntent.id,
    amount: grandTotalPrice,
    currency: paymentIntent.currency,
    status: "pending",
  });
  await newPaymentRecord.save();

  await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: { paymentId: newPaymentRecord._id } }
  );

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: newPaymentRecord._id,
    totalAmount: grandTotalPrice,
    currency: paymentIntent.currency,
  };
};

//

const getOrders = async (user) => {
  const orders = await Order.find({ customer: user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "meals.meal",
      select: "name price mainImage",
    })
    .populate({
      path: "cook",
      select: "firstName lastName profilePicture",
    });

  const formattedOrders = orders.map((order) => ({
    id: order._id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    cook: order.cook
      ? {
          id: order.cook._id,
          name: `${order.cook.firstName} ${order.cook.lastName}`,
          // profilePicture: order.cook.profilePicture
        }
      : null,
    meals: order.meals.map((item) => ({
      id: item.meal?._id,
      name: item.meal?.name,
      price: item.meal?.price,
      mainImage: item.meal?.mainImage,
      quantity: item.quantity,
      subtotal: item.meal ? (item.meal.price * item.quantity).toFixed(2) : 0,
    })),
    deliveryAddress: order.deliveryAddress,
  }));

  return formattedOrders;
};

const getOrderByCookId = async (cookIdObject) => {
  const cookId = cookIdObject.id;

  const orders = await Order.find({
    "meals.meal": { $exists: true }, //  to ensure meal exists
  })
    .populate("customer", "firstName lastName email profilePicture")
    .populate({
      path: "meals.meal",
      match: { cook: cookId },
      select: "_id cook name price images",
    });

  const filteredOrders = orders.filter((order) =>
    order.meals.some((item) => item.meal !== null)
  );

  const result = filteredOrders.map((order) => ({
    _id: order._id,
    customer: {
      _id: order.customer?._id,
      firstName: order.customer?.firstName || "",
      lastName: order.customer?.lastName || "",
      email: order.customer?.email || "",
      profilePicture:
        order.customer?.profilePicture || "https://via.placeholder.com/150",
    },
    meals: order.meals
      .filter((item) => item.meal !== null)
      .map((item) => ({
        meal: item.meal._id,
        quantity: item.quantity,
        _id: item._id,
        name: item.meal.name,
        price: item.meal.price,
        images: item.meal.images,
      })),
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    __v: order.__v,
  }));

  return result;
};

const updateOrderStatus = async (user, body) => {
  const { orderId, action } = body;
  const cookId = new mongoose.Types.ObjectId(user.id);
  const cookName = `${user.firstName} ${user.lastName}`;

  const order = await Order.findOne({ _id: orderId, cook: cookId });
  if (!order) throw new Error("Order not found or unauthorized");

  if (order.status !== "pending" && order.status !== "accepted") {
    throw new Error("Order has already been processed");
  }

  if (action === "accept") {
    order.status = "accepted";
  } else if (action === "cancel") {
    order.status = "cancelled";
  } else if (action === "complete") {
    order.status = "completed";
  } else {
    throw new Error("Invalid action");
  }

  await order.save();

  const message = `Your order was ${order.status} by ${cookName}.`;

  await Notification.create({
    user: order.customer,
    order: order._id,
    message,
  });

  // Send real-time notification via Socket.IO
  const io = require("../index").app.get("io");
  const connectedUsers = require("../index").app.get("connectedUsers");

  const customerSocketId = connectedUsers.get(order.customer.toString());
  console.log(connectedUsers);
  console.log(customerSocketId);
  if (customerSocketId) {
    io.to(customerSocketId).emit("orderStatusUpdate", {
      //  event name
      message,
      orderId: order._id,
      status: order.status,
      cookName: cookName,
    });
    console.log(
      `Order status update sent to customer ${order.customer} via Socket.IO`
    );
  } else {
    console.log(
      `Customer ${order.customer} is not currently connected via Socket.IO.`
    );
  }

  return order;
};

const getAllNotifications = async (userId) => {
  const UserId = new mongoose.Types.ObjectId(userId);

  const notifications = await Notification.find({ user: UserId })
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName");

  return notifications;
};

const updateNotificationReadStatus = async (user, body) => {
  const userIdString = user.id;
  const notificationIdString = body.notificationId;

  const objectIdUserId = new mongoose.Types.ObjectId(userIdString);
  const objectIdNotificationId = new mongoose.Types.ObjectId(
    notificationIdString
  );

  // Find the notification and ensure it belongs to the authenticated user
  const notification = await Notification.findOneAndUpdate(
    { _id: objectIdNotificationId, user: objectIdUserId },
    { isRead: true },
    { new: true } // Returns the updated document
  );

  if (!notification) {
    const error = new Error("Notification not found or unauthorized.");
    error.status = 404;
    throw error;
  }

  return notification;
};

// mark ALL notifications for a user as read
const markAllNotificationsAsRead = async (userId) => {
  const objectIdUserId = new mongoose.Types.ObjectId(userId);

  await Notification.updateMany(
    { user: objectIdUserId, isRead: false }, // Use the converted ObjectId
    { isRead: true }
  );
  return { message: "All notifications marked as read." };
};

const getOrderByIdForCustomer = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: userId })
    .populate({
      path: "meals.meal",
      select: "name price mainImage",
    })
    .populate({
      path: "cook",
      select: "firstName lastName profilePicture",
    });
  if (!order) return null;
  const formattedOrder = {
    id: order._id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    cook: order.cook
      ? {
          id: order.cook._id,
          name: `${order.cook.firstName} ${order.cook.lastName}`,
          // profilePicture: order.cook.profilePicture
        }
      : null,
    meals: order.meals.map((item) => ({
      id: item.meal?._id,
      name: item.meal?.name,
      price: item.meal?.price,
      mainImage: item.meal?.mainImage,
      quantity: item.quantity,
      subtotal: item.meal ? (item.meal.price * item.quantity).toFixed(2) : 0,
    })),
    deliveryAddress: order.deliveryAddress,
  };
  return formattedOrder;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderByCookId,
  createPaymentIntentForOrders,
  updateOrderStatus,
  getAllNotifications,
  markAllNotificationsAsRead,
  updateNotificationReadStatus,
  getOrderByIdForCustomer,
};
