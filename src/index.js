const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("./middlewares/cors.js");

const app = express();
const PORT = process.env.PORT || 3000;

// DB connection
const dbconnect = require("../src/config/DbConnect.js");
dbconnect();

// Middleware
app.use(cors); // Add CORS middleware
app.use(morgan("dev"));
app.use(express.json());

// 👉 Import your route
const authRoutes = require("./routes/authRoute.js");
const userRoutes = require("./routes/userRoute.js");
const mealRoutes = require("./routes/mealRoutes.js");
const cartRoutes = require("./routes/cartRouter.js");
const oerderRoutes = require("./routes/orderRouter.js");
const adminRoutes = require("./routes/adminRouter.js");  

// 👉 Use the route with a base path
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", oerderRoutes);
app.use("/api/admin", adminRoutes);

// Custom Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error for debugging
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    // Include stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Gracefully shutting down...");
  await mongoose.disconnect();
  process.exit(0);
});
