const Joi = require('joi');
const jwt = require('jsonwebtoken');


exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'cook', 'admin').required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    // Optional fields
    profilePicture: Joi.string().uri(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
    }),
    cookProfile: Joi.object({
      bio: Joi.string(),
      cuisineSpecialties: Joi.array().items(Joi.string()),
    }),
    customerProfile: Joi.object({
      favorites: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)), // MongoDB ObjectId format
    }),
  });

  // Validate schema
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Extract requesterRole from JWT (if present)
  let requesterRole = null;
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      requesterRole = decoded.role || null;
    } catch {
      // Invalid token, proceed without requesterRole
    }
  }

  const { role } = req.body;

  // Role-based validation
  // 1. Public users (no requesterRole) cannot register as admin
  if (!requesterRole && role === 'admin') {
    return res.status(403).json({ error: 'Unauthorized to register as admin' });
  }

  // 2. Non-admins cannot create admins
  if (role === 'admin' && requesterRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create other admins' });
  }

  next();
};