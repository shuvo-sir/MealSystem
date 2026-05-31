import express from "express";
import { validateRequest } from "../middleware/validation.middleware.js";

import {
  addGroupNote,
  getGroupNotes,
  deleteGroupNote,
} from "../controllers/groupNote.controller.js";

const router = express.Router();


// add note - with validation
router.post("/add", validateRequest("groupNote"), addGroupNote);

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
