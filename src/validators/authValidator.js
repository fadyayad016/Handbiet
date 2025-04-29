const Joi = require('joi');

exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'cook', 'admin').required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),

    // optional fields
    profilePicture: Joi.string().uri(),
    
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string()
    }),

    cookProfile: Joi.object({
      bio: Joi.string(),
      cuisineSpecialties: Joi.array().items(Joi.string())
    }),

    customerProfile: Joi.object({
      favorites: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // MongoDB ObjectId format
    })
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  next();
};
