import test from "node:test";
import assert from "node:assert/strict";

import { buildMonthSummary } from "../src/controllers/meal.controller.js";

test("buildMonthSummary returns zero totals for a fresh month with no activity", () => {
  const summary = buildMonthSummary({
    entries: [],
    deposits: [],
    expenses: [],
  });

  assert.deepEqual(summary, {
    totalExpense: 0,
    totalDeposit: 0,
    totalMeals: 0,
    mealRate: 0,
  });
});
