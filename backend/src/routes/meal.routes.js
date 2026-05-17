import express from "express";
import {
  createMealGroup,
} from "../controllers/meal.controller.js";
import authMiddleware
from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  createMealGroup
);

export default router;