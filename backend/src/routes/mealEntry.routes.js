import express from "express";

import {
  addMealEntry,
  getMealHistory,
  updateMealEntry,
  deleteMealEntry,
} from "../controllers/mealEntry.controller.js";

const router = express.Router();

router.post("/add", addMealEntry);
router.get("/history", getMealHistory);
router.patch("/:entryId", updateMealEntry);
router.delete("/:entryId", deleteMealEntry);

export default router;
