import { clerkMiddleware, getAuth } from "@clerk/express";

// Apply Clerk's middleware globally first
export const applyClerkMiddleware = clerkMiddleware();

// Custom auth middleware to validate that user is authenticated
export const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    console.log("AUTH ERROR: No userId found in request. Token may be invalid or expired.");
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  console.log(`AUTH SUCCESS: userId = ${userId}`);
  req.auth.userId = userId; // Ensure userId is set
  next();
};