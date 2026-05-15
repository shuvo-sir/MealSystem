import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mealGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealGroup",
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
  "Deposit",
  depositSchema
);