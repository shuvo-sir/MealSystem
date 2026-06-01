import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Rate limiting configurations for different endpoint types
 */

// Public endpoints - stricter limit (signup, login, etc.)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { 
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.auth && req.auth.userId;
  },
  keyGenerator: ipKeyGenerator,
});

// General authenticated endpoints - moderate limit
const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  keyGenerator: (req) => req.auth?.userId || ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.auth?.userId, // Only rate limit authenticated users
});

// Finance endpoints - stricter limit (prevent spam on financial operations)
const financeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  keyGenerator: (req) => req.auth?.userId || ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Too many financial requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.auth?.userId,
});

// Meal entry endpoints - moderate limit
const mealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per windowMs
  keyGenerator: (req) => req.auth?.userId || ipKeyGenerator(req),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.auth?.userId,
});

export {
  publicLimiter,
  authenticatedLimiter,
  financeLimiter,
  mealLimiter,
};
