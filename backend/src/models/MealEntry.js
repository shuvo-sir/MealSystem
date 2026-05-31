import mongoose from "mongoose";

const mealEntrySchema = new mongoose.Schema(
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

    date: {
      type: String,
      required: true,
    },

    breakfast: {
      type: Number,
      default: 0,
    },

    lunch: {
      type: Number,
      default: 0,
    },

    dinner: {
      type: Number,
      default: 0,
    },

    totalMeals: {
      type: Number,
      default: 0,
    },

    mealRateAtCreation: {
      type: Number,
      default: 0,
      description: "Snapshot of meal rate at time of entry creation for accurate historical billing",
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "MealEntry",
  mealEntrySchema
);