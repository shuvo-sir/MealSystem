import express from "express";
import {
  createMealGroup,
  getMyMealGroup,
} from "../controllers/meal.controller.js";
import authMiddleware
from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/my-group",
  authMiddleware,
  getMyMealGroup
);

router.post(
  "/create",
  authMiddleware,
  createMealGroup
);

export default router;
