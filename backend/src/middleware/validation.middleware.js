import Joi from 'joi';

// Define validation schemas for different endpoints
const validationSchemas = {
  deposit: Joi.object({
    userId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    note: Joi.string().optional().allow(''),
  }),

  expense: Joi.object({
    title: Joi.string().required().min(1).max(200),
    amount: Joi.number().positive().required(),
    note: Joi.string().optional().allow(''),
  }),

  mealEntry: Joi.object({
    userId: Joi.string().required(),
    date: Joi.date().required(),
    breakfast: Joi.number().integer().min(0).required(),
    lunch: Joi.number().integer().min(0).required(),
    dinner: Joi.number().integer().min(0).required(),
    note: Joi.string().optional().allow(''),
  }),

  groupNote: Joi.object({
    userId: Joi.string().required(),
    message: Joi.string().required().min(1).max(1000),
  }),

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
