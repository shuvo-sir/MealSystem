import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["member", "manager"],
      default: "member",
    },

    mealGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealGroup",
      default: null,
    },

    balance: {
      type: Number,
      default: 0,
    },

    totalMeals: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);