import express from "express";
import {
  createMealGroup,
  getMyMealGroup,
} from "../controllers/meal.controller.js";

const router = express.Router();

// Protected routes - authentication handled by global clerkMiddleware in app.js
router.get("/my-group", getMyMealGroup);
router.post("/create", createMealGroup);

export default router;