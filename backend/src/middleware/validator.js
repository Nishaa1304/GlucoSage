const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Validation Schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().required().max(50).trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(6).required(),
    age: Joi.number().min(1).max(120).required(),
    userType: Joi.string().valid('patient', 'doctor').required(),
    language: Joi.string().valid('en', 'hi').default('en'),
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/),
    diagnosisType: Joi.string().valid('Type 1 Diabetes', 'Type 2 Diabetes', 'Pre-Diabetes', 'Gestational Diabetes', 'None')
  }),

  login: Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().max(50).trim(),
    age: Joi.number().min(1).max(120),
    language: Joi.string().valid('en', 'hi'),
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/),
    diagnosisType: Joi.string().valid('Type 1 Diabetes', 'Type 2 Diabetes', 'Pre-Diabetes', 'Gestational Diabetes', 'None'),
    targetGlucoseRange: Joi.object({
      min: Joi.number().min(50).max(150),
      max: Joi.number().min(100).max(250)
    })
  }),

  glucoseReading: Joi.object({
    value: Joi.number().min(20).max(600).required(),
    readingType: Joi.string().valid('fasting', 'post-meal', 'random', 'before-meal', 'bedtime').required(),
    mealContext: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack', 'none').default('none'),
    notes: Joi.string().max(500),
    symptoms: Joi.array().items(Joi.string().valid('normal', 'dizzy', 'tired', 'thirsty', 'hungry', 'headache', 'shaky')),
    mood: Joi.string().valid('good', 'okay', 'bad', 'stressed', 'anxious')
  }),

  linkABHA: Joi.object({
    abhaNumber: Joi.string().pattern(/^\d{2}-\d{4}-\d{4}-\d{4}$/).required(),
    abhaAddress: Joi.string().required().lowercase().trim()
  }),

  voiceQuery: Joi.object({
    transcript: Joi.string().required(),
    language: Joi.string().valid('en-US', 'hi-IN').default('en-US'),
    intent: Joi.string().valid('scan', 'prediction', 'abha', 'query', 'unknown')
  })
};

module.exports = { validate, schemas };
