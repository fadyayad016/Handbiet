const bcrypt = require('bcrypt');
const User = require('../models/userAuth');
const jwt = require('jsonwebtoken');


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
  
    return { message: 'User registered successfully'};
  };
  
  

const loginUser = async (userData) => {
    const { email, password } = userData;
    const existingUser = await User.findOne({ email });
    if (!existingUser) { throw new Error('Invalid email or password'); }


    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email,role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    // console.log('Issued token payload:', {
    //   id: existingUser._id,
    //   email: existingUser.email,
    //   role: existingUser.role
    // });

    return { token };
    

}









module.exports = { registerUser, loginUser };
