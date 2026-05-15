import mongoose from "mongoose";

const mealGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },

    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    totalExpense: {
      type: Number,
      default: 0,
    },

    totalDeposit: {
      type: Number,
      default: 0,
    },

    mealRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "MealGroup",
  mealGroupSchema
);