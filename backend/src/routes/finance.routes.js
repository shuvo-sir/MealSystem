import express from "express";

import {
  addDeposit,
  addExpense,
  getTransactions,
  getExpenseHistory,
} from "../controllers/finance.controller.js";

const router = express.Router();

// deposit
router.post("/deposit", addDeposit);

// expense
router.post("/expense", addExpense);

// transactions and history
router.get("/transactions", getTransactions);
router.get("/expenses", getExpenseHistory);

export default router;