const asyncHandler = require('express-async-handler');

module.exports = asyncHandler((req, res, next) => {
  console.log('User role:', req.user?.role);
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Only customers can access the cart.' });
  }
  return next(); 
});



