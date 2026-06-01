import Joi from 'joi';

// Define validation schemas for different endpoints
const validationSchemas = {
  deposit: Joi.object({
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    note: Joi.string().optional().allow('').max(500),
  }).unknown(false),

  expense: Joi.object({
    title: Joi.string().required().min(1).max(200).trim().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty'
    }),
    amount: Joi.number().positive().required().messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
    note: Joi.string().optional().allow('').max(500),
  }).unknown(false),

  mealEntry: Joi.object({
    date: Joi.alternatives().try(
      Joi.string().isoDate(),
      Joi.date()
    ).required().messages({
      'any.required': 'Date is required'
    }),
    breakfast: Joi.number().integer().min(0).required().messages({
      'number.min': 'Breakfast value cannot be negative'
    }),
    lunch: Joi.number().integer().min(0).required().messages({
      'number.min': 'Lunch value cannot be negative'
    }),
    dinner: Joi.number().integer().min(0).required().messages({
      'number.min': 'Dinner value cannot be negative'
    }),
    note: Joi.string().optional().allow('').max(500),
  }).unknown(false),

  groupNote: Joi.object({
    message: Joi.string().required().min(1).max(1000).trim().messages({
      'any.required': 'Message is required',
      'string.empty': 'Message cannot be empty'
    }),
  }).unknown(false),

  mealGroup: Joi.object({
    groupName: Joi.string().required().min(1).max(100),
  }),

  updateMealEntry: Joi.object({
    breakfast: Joi.number().integer().min(0).optional(),
    lunch: Joi.number().integer().min(0).optional(),
    dinner: Joi.number().integer().min(0).optional(),
    date: Joi.date().optional(),
    note: Joi.string().optional().allow(''),
  }),
};

// Middleware factory to validate request body against schema
const validateRequest = (schemaKey) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaKey];
    
    if (!schema) {
      return res.status(500).json({ 
        success: false, 
        message: 'Validation schema not configured',
        code: 'VALIDATION_CONFIG_ERROR'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

export { validateRequest, validationSchemas };
