import express from "express";

import {
  addGroupNote,
  getGroupNotes,
} from "../controllers/groupNote.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();


// add note
router.post("/add", authMiddleware, addGroupNote);

// get notes
router.get(
  "/:groupId",
  authMiddleware,
  getGroupNotes
);

export default router;
