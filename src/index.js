const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("./middlewares/cors.js");

const app = express();
const http = require("http");
const server = http.createServer(app);

// Socket.io setup 
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
// Map  socket for every user
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", (userId) => {
    console.log(`User ${userId} registered with socket ${socket.id}`);
    connectedUsers.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

app.set("io", io);
app.set("connectedUsers", connectedUsers);

// DB connection
const dbconnect = require("../src/config/DbConnect.js");
dbconnect();

// Middleware
app.use(cors); // Add CORS middleware
app.use(morgan("dev"));
// For Error: request entity too large
app.use(express.json({ limit: "6mb" }));

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Gracefully shutting down...");
  await mongoose.disconnect();
  process.exit(0);
});
module.exports = { app };
