import express from "express";

import {
  addMealEntry,
} from "../controllers/mealEntry.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addMealEntry);

export default router;
