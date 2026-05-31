import rateLimit from "express-rate-limit";

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
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for authenticated requests (they have their own limit)
    return req.auth && req.auth.userId;
  },
});

// General authenticated endpoints - moderate limit
const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  keyGenerator: (req) => {
    // Use userId as key instead of IP for authenticated requests
    return req.auth?.userId || req.ip;
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Finance endpoints - stricter limit (prevent spam on financial operations)
const financeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  keyGenerator: (req) => req.auth?.userId || req.ip,
  message: {
    success: false,
    message: 'Too many financial requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Meal entry endpoints - moderate limit
const mealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per windowMs
  keyGenerator: (req) => req.auth?.userId || req.ip,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export {
  publicLimiter,
  authenticatedLimiter,
  financeLimiter,
  mealLimiter,
};
