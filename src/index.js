const express = require('express');
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// DB connection
const dbconnect = require('../src/config/DbConnect.js');
dbconnect(); 

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// 👉 Import your route
const authRoutes = require('./routes/authRoute.js');
const userRoutes = require('./routes/userRoute.js');  
const mealRoutes = require('./routes/mealRoutes.js');
// const cartRoutes = require('./routes/cartRouter.js'); 


// 👉 Use the route with a base path
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meals', mealRoutes);
// app.use('/api/cart', cartRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});



process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down...');
  await mongoose.disconnect();
  process.exit(0);
});
