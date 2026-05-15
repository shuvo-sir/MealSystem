import express from "express";

import {
  addGroupNote,
  getGroupNotes,
} from "../controllers/groupNote.controller.js";

const router = express.Router();


// add note
router.post("/add", addGroupNote);

// get notes
router.get(
  "/:groupId",
  getGroupNotes
);

export default router;