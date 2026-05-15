import express from "express";
import {
  joinMealGroup,
  getPendingRequests,
  acceptMember,
  rejectMember,
} from "../controllers/member.controller.js";

const router = express.Router();

// user requests to join meal group
router.post("/join", joinMealGroup);

// manager views pending join requests for a meal group
router.get("/requests/:groupId", getPendingRequests);
router.patch("/accept/:requestId", acceptMember);
router.patch("/reject/:requestId", rejectMember);

export default router;