const authService = require('../services/authService.js');
const asyncHandler = require('express-async-handler');




exports.register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.registerUser(userData);
  res.status(201).json(result);
});




exports.login = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.loginUser(userData);
  res.status(201).json(result);

});


exports.refreshToken = asyncHandler(async (req, res) => {
  
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json(result);
 
})



