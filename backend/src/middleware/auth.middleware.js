import { clerkMiddleware, getAuth } from "@clerk/express";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error("Missing CLERK_SECRET_KEY in backend environment. Clerk auth will not work.");
}

// Apply Clerk's middleware globally first
export const applyClerkMiddleware = clerkMiddleware({
  secretKey: clerkSecretKey,
});

const normalizeAuth = (req) => {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    console.log("AUTH HEADER: Bearer token present");
  } else {
    console.log("AUTH HEADER: none");
  }

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
