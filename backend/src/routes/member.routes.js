import express from "express";
import {
  joinMealGroup,
  getPendingRequests,
  acceptMember,
  rejectMember,
} from "../controllers/member.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// user requests to join meal group
router.post("/join", authMiddleware, joinMealGroup);

// manager views pending join requests for a meal group
router.get(
  "/requests/:groupId",
  authMiddleware,
  getPendingRequests
);
router.patch(
  "/accept/:requestId",
  authMiddleware,
  acceptMember
);
router.patch(
  "/reject/:requestId",
  authMiddleware,
  rejectMember
);

export default router;
