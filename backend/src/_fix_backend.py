from pathlib import Path

files = {
    'backend/src/middleware/auth.middleware.js': '''import { clerkMiddleware, getAuth } from "@clerk/express";

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
''',
    'backend/src/config/db.js': '''import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MONGO_URI is not configured. Skipping MongoDB connection.");
    return false;
  }

  try {
    console.log("🔗 Attempting MongoDB connection...");
    console.log("MONGO_URI present:", !!process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✓ MongoDB Connected successfully");
    console.log("DB Name:", mongoose.connection.name);
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
    console.warn("⚠️ Server startup continues, but database operations may fail.");
    return false;
  }
};

export default connectDB;
'''
}

for path, content in files.items():
    Path(path).write_text(content, encoding='utf-8')
    print(f'Wrote {path}')
