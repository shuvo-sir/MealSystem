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

        // auto delete after 24 hours
        expires: 86400,
      },
    }
  );

export default mongoose.model(
  "GroupNote",
  groupNoteSchema
);