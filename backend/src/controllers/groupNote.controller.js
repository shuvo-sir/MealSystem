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

    const user = await User.findOne({
      clerkId: req.auth.userId,
    });

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

    console.log(`[addGroupNote] Note created: ${note._id}`);

    res.status(201).json({
      success: true,
      message: "Note added",
      note,
    });
  } catch (error) {
    console.log(`[addGroupNote] Error: ${error.message}`);
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

    console.log(`[getGroupNotes] Retrieved ${notes.length} notes for group: ${groupId}`);

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.log(`[getGroupNotes] Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
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
        message: "Note not found",
      });
    }

    // Verify the user is the note creator
    const user = await User.findOne({
      clerkId: req.auth.userId,
    });

    if (!user || note.user.toString() !== user._id.toString()) {
      console.log(`[deleteGroupNote] Unauthorized delete attempt for note: ${noteId}`);
      return res.status(403).json({
        message: "Unauthorized: Cannot delete other users' notes",
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
      message: error.message,
    });
  }
};
