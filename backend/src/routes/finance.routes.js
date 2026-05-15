import express from "express";

import {
  addDeposit,
  addExpense,
} from "../controllers/finance.controller.js";

const router = express.Router();

// deposit
router.post("/deposit", addDeposit);

// expense
router.post("/expense", addExpense);

export default router;