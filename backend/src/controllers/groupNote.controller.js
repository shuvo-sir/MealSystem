import GroupNote from "../models/GroupNote.js";
import User from "../models/User.js";


// =============================
// ADD NOTE
// =============================

export const addGroupNote = async (
  req,
  res
) => {
  try {
    const { userId, message } =
      req.body;

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mealGroup) {
      return res.status(400).json({
        message:
          "Join meal group first",
      });
    }

    const note =
      await GroupNote.create({
        user: user._id,
        mealGroup: user.mealGroup,
        message,
      });

    res.status(201).json({
      success: true,
      message: "Note added",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =============================
// GET GROUP NOTES
// =============================

export const getGroupNotes = async (
  req,
  res
) => {
  try {
    const { groupId } = req.params;

    const notes =
      await GroupNote.find({
        mealGroup: groupId,
      })
        .populate("user", "name")
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};