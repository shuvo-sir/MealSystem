import express from "express";
import {
  joinMealGroup,
  getPendingRequests,
  acceptMember,
  rejectMember,
  leaveGroup,
} from "../controllers/member.controller.js";

const router = express.Router();

// Authentication handled by global clerkMiddleware in app.js
router.post("/join", joinMealGroup);

router.get(
  "/requests/:groupId",
  getPendingRequests
);

router.patch(
  "/accept/:requestId",
  acceptMember
);

router.patch(
  "/reject/:requestId",
  rejectMember
);

router.post("/leave", leaveGroup);

export default router;
