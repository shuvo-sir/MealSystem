import express from "express";
import {
  getCurrentUser,
  debugMe,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get current user - authentication handled by global clerkMiddleware in app.js
router.get("/me", getCurrentUser);

// Debug endpoint for troubleshooting auth issues
router.get("/debug/me", debugMe);

export default router;
