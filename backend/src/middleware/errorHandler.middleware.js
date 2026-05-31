/**
 * Standardized error response middleware
 * Catches unhandled errors and returns consistent error format:
 * { success: false, message: string, code: string, data?: any }
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', {
    message: err.message,
    code: err.code || 'INTERNAL_ERROR',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let data = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    data = err.details || err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID_FORMAT';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_RESOURCE';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    code = err.code || 'ERROR';
    message = err.message;
  }

  // If it's an authorization error
  if (err.code === 'UNAUTHORIZED' || err.statusCode === 401) {
    statusCode = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  }

  if (err.code === 'FORBIDDEN' || err.statusCode === 403) {
    statusCode = 403;
    message = err.message || 'Forbidden';
    code = 'FORBIDDEN';
  }

  // Send standardized error response
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(data && { data }),
  });
};

export default errorHandler;
