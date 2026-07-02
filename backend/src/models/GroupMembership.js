import mongoose from "mongoose";

const groupMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealGroup",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "left"],
      default: "active",
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

groupMembershipSchema.index(
  { user: 1, mealGroup: 1, status: 1 },
  { name: "user_mealGroup_status_idx" }
);

export default mongoose.model("GroupMembership", groupMembershipSchema);