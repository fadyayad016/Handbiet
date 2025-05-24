// CORS middleware for Express.js
const cors = require("cors");

module.exports = cors({
  origin: "*", // Allow all origins (for development). Change to specific origin(s) in production.
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
