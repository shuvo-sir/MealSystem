import express from "express";
import { validateRequest } from "../middleware/validation.middleware.js";

import {
  addMealEntry,
  getMealHistory,
  updateMealEntry,
  deleteMealEntry,
} from "../controllers/mealEntry.controller.js";

const router = express.Router();

router.post("/add", validateRequest("mealEntry"), addMealEntry);
router.get("/history", getMealHistory);
router.patch("/:entryId", validateRequest("updateMealEntry"), updateMealEntry);
router.delete("/:entryId", deleteMealEntry);

export default router;
