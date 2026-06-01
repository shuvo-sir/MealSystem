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
    const { message } = req.body;

    const user = await User.findOne({
      clerkId: req.auth.userId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.mealGroup) {
      return res.status(400).json({
        success: false,
        message:
          "Join meal group first",
        code: "NO_MEAL_GROUP",
      });
    }

    const note =
      await GroupNote.create({
        user: user._id,
        mealGroup: user.mealGroup,
        message,
      });

    console.log(`[addGroupNote] Note created: ${note._id}`);

    res.status(201).json({
      success: true,
      message: "Note added",
      note,
    });
  } catch (error) {
    console.log(`[addGroupNote] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
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
    const { page = 0, limit = 50 } = req.query;

    const pageNum = Math.max(0, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = pageNum * limitNum;

    const notes =
      await GroupNote.find({
        mealGroup: groupId,
      })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    const total = await GroupNote.countDocuments({ mealGroup: groupId });

    console.log(`[getGroupNotes] Retrieved ${notes.length} notes for group: ${groupId}`);

    res.json({
      success: true,
      notes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(`[getGroupNotes] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};


// =============================
// DELETE GROUP NOTE
// =============================

export const deleteGroupNote = async (
  req,
  res
) => {
  try {
    const { noteId } = req.params;

    // Find the note first to verify ownership
    const note = await GroupNote.findById(noteId);

    if (!note) {
      console.log(`[deleteGroupNote] Note not found: ${noteId}`);
      return res.status(404).json({
        success: false,
        message: "Note not found",
        code: "NOT_FOUND",
      });
    }

    // Verify the user is the note creator
    const user = await User.findOne({
      clerkId: req.auth.userId,
    });

    if (!user || note.user.toString() !== user._id.toString()) {
      console.log(`[deleteGroupNote] Unauthorized delete attempt for note: ${noteId}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Cannot delete other users' notes",
        code: "FORBIDDEN",
      });
    }

    // Delete the note
    await GroupNote.findByIdAndDelete(noteId);

    console.log(`[deleteGroupNote] Note deleted: ${noteId}`);

    res.json({
      success: true,
      message: "Note deleted",
    });
  } catch (error) {
    console.log(`[deleteGroupNote] Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};
