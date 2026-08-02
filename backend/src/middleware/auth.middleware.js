import { clerkMiddleware, getAuth } from "@clerk/express";

// Apply Clerk's middleware globally first
export const applyClerkMiddleware = clerkMiddleware();

const normalizeAuth = (req) => {
  const clerkAuth = getAuth(req) || {};
  const existingAuth = req.auth || {};
  const userId = clerkAuth.userId || existingAuth.userId || null;

  req.auth = {
    ...existingAuth,
    ...clerkAuth,
    userId,
    claims: clerkAuth.claims || existingAuth.claims || {},
  };

  return req.auth;
};

// Custom auth middleware to validate that user is authenticated
export const requireAuth = (req, res, next) => {
  const auth = normalizeAuth(req);

  if (!auth.userId) {
    console.log("AUTH ERROR: No userId found in request. Token may be invalid or expired.");
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  console.log(`AUTH SUCCESS: userId = ${auth.userId}`);
  next();
};
