import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    mealGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealGroup",
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Expense",
  expenseSchema
);