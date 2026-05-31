import express from "express";
import { validateRequest } from "../middleware/validation.middleware.js";

import {
  addDeposit,
  addExpense,
  getTransactions,
  getExpenseHistory,
} from "../controllers/finance.controller.js";

const router = express.Router();

// deposit - with validation
router.post("/deposit", validateRequest("deposit"), addDeposit);

// expense - with validation
router.post("/expense", validateRequest("expense"), addExpense);

// transactions and history
router.get("/transactions", getTransactions);
router.get("/expenses", getExpenseHistory);

export default router;