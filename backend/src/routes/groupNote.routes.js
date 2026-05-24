import express from "express";

import {
  addGroupNote,
  getGroupNotes,
  deleteGroupNote,
} from "../controllers/groupNote.controller.js";

const router = express.Router();


// add note
router.post("/add", addGroupNote);

// get notes
router.get(
  "/:groupId",

  getGroupNotes
);

// delete note
router.delete(
  "/:noteId",
  deleteGroupNote
);

export default router;
