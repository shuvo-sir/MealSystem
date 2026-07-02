import mongoose from "mongoose";

const financeAdjustmentSchema = new mongoose.Schema(
  {
    mealGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealGroup",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    monthKey: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["credit", "due"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

financeAdjustmentSchema.index(
  { mealGroup: 1, user: 1, monthKey: 1 },
  { name: "finance_adjustment_month_idx" }
);

export default mongoose.model("FinanceAdjustment", financeAdjustmentSchema);