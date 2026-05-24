import mongoose from "mongoose";

const groupNoteSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      mealGroup: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "MealGroup",
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 86400 }, // Auto-delete after 24 hours (86400 seconds)
      },
    }
  );

export default mongoose.model(
  "GroupNote",
  groupNoteSchema
);