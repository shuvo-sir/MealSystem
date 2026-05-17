import express from "express";
import {
  createUser,
  getCurrentUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", createUser);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
