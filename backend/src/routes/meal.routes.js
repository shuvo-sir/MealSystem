import express from "express";
import {
  createMealGroup,
} from "../controllers/meal.controller.js";

const router = express.Router();

router.post(
  "/create",
  createMealGroup
);

export default router;