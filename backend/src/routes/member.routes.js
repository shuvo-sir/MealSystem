import express from "express";
import {
  joinMealGroup,
  getPendingRequests,
  acceptMember,
  rejectMember,
  leaveGroup,
  transferManager,
} from "../controllers/member.controller.js";
import { requireGroupManager } from "../utils/authorizationHelpers.js";

const router = express.Router();

// Authentication handled by global clerkMiddleware in app.js
router.post("/join", joinMealGroup);

router.get(
  "/requests/:groupId",
  requireGroupManager,
  getPendingRequests
);

router.patch(
  "/accept/:requestId",
  requireGroupManager,
  acceptMember
);

router.patch(
  "/reject/:requestId",
  requireGroupManager,
  rejectMember
);

router.patch(
  "/transfer-manager",
  requireGroupManager,
  transferManager
);

router.post("/leave", leaveGroup);

export default router;
