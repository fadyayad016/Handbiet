const asyncHandler = require('express-async-handler');

module.exports = asyncHandler((req, res, next) => {
  console.log('User role:', req.user?.role);
  if (!req.user || req.user.role !== 'cook') {
    return res.status(403).json({ message: 'Access denied. Only cook can access the cart.' });
  }
  return next(); 
});



