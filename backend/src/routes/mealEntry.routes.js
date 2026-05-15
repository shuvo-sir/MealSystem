import express from "express";

import {
  addMealEntry,
} from "../controllers/mealEntry.controller.js";

const router = express.Router();

router.post("/add", addMealEntry);

export default router;