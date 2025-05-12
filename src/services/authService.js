const bcrypt = require('bcrypt');
const User = require('../models/userAuth');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET
    , { expiresIn: '24h' });
}


const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id },
    process.env.JWT_REFRESH_SECRET
    , { expiresIn: '7d' });
}



const registerUser = async (userData) => {
  const { email, password, role, firstName, lastName, ...optionalData } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    ...optionalData,
  });

  await user.save();

  return { message: 'User registered successfully' };
};



const loginUser = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (!existingUser) { throw new Error('Invalid email or password'); }


  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }


  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  existingUser.refreshToken = refreshToken;
  await existingUser.save();

  return { accessToken, refreshToken };




};


const refreshAccessToken = asyncHandler(async (refreshToken) => {

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findOne({ _id: decoded.id, refreshToken: refreshToken });

  if (!user) {
    throw new Error('Invalid refresh token');
  }
  const accessToken = generateAccessToken(user);
  return { accessToken };



})












module.exports = { registerUser, loginUser, refreshAccessToken };
