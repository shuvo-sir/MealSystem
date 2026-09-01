import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import JoinRequest from "../models/JoinRequest.js";
import GroupMembership from "../models/GroupMembership.js";
import { getMealGroupPayloadForUser } from "./meal.controller.js";
import {
  normalizeManagerDuration,
  resolveExpiredManagerDelegation,
  transferGroupManager,
} from "../utils/managerDelegation.js";


// Join meal group with invite code
export const joinMealGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const clerkId = req.auth.userId;

    console.log(`[joinMealGroup] Starting join process for clerkId: ${clerkId}, inviteCode: ${inviteCode}`);

    let user = await User.findOne({ clerkId });

    // Auto-create user if not found (fallback for sync issues)
    if (!user) {
      console.log(`[joinMealGroup] User not found for clerkId: ${clerkId}. Creating user...`);
      
      try {
        // Create a minimal user record
        user = new User({
          clerkId,
          name: `User_${clerkId.substring(0, 8)}`,
          email: `${clerkId}@mealapp.local`,
          role: "member",
          balance: 0,
          totalMeals: 0,
        });

        await user.save();
        console.log(`[joinMealGroup] User created successfully: ${user._id}`);
      } catch (createError) {
        console.log(`[joinMealGroup] Error creating user: ${createError.message}`);
        return res.status(500).json({
          message: "Failed to create user account. Please try signing up again.",
        });
      }
    }

    // Check already in group
    if (user.mealGroup) {
      console.log(`[joinMealGroup] User already in group: ${user.mealGroup}`);
      return res.status(400).json({
        message: "Already in a meal group",
      });
    }

    // Find meal group by invite code
    const group = await MealGroup.findOne({ inviteCode });

    if (!group) {
      console.log(`[joinMealGroup] Invalid invite code: ${inviteCode}`);
      return res.status(404).json({
        message: "Invalid invite code",
      });
    }

    // Create a pending join request instead of immediately adding user to group
    const existingRequest = await JoinRequest.findOne({
      user: user._id,
      mealGroup: group._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already submitted a request to join this group. Please wait for manager approval.",
      });
    }

    // Create new JoinRequest with pending status
    const joinRequest = new JoinRequest({
      user: user._id,
      mealGroup: group._id,
      status: "pending",
    });

    await joinRequest.save();

    console.log(`[joinMealGroup] Join request created with pending status for user: ${user._id}, group: ${group._id}`);

    res.status(201).json({
      success: true,
      message: "Request submitted. Awaiting manager approval.",
    });
  } catch (error) {
    console.log(`[joinMealGroup] Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!req.user?.mealGroup || req.user.mealGroup.toString() !== groupId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view pending requests for your own group",
      });
    }

    const requests = await JoinRequest.find({
      mealGroup: groupId,
      status: "pending",
    }).populate("user");

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const acceptMember = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const user = await User.findById(request.user);
    const group = await MealGroup.findById(request.mealGroup);

    if (!req.user?.mealGroup || req.user.mealGroup.toString() !== group._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only accept requests for your own group",
      });
    }

    // add user to group
    user.mealGroup = group._id;
    await user.save();

    group.members.push(user._id);
    await group.save();

    const activeMembership = await GroupMembership.findOne({
      user: user._id,
      mealGroup: group._id,
      status: "active",
    });

    if (activeMembership) {
      activeMembership.leftAt = null;
      await activeMembership.save();
    } else {
      await GroupMembership.create({
        user: user._id,
        mealGroup: group._id,
        status: "active",
      });
    }

    request.status = "accepted";
    await request.save();

    res.json({
      success: true,
      message: "Member accepted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



export const rejectMember = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (!req.user?.mealGroup || req.user.mealGroup.toString() !== request.mealGroup.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only reject requests for your own group",
      });
    }

    request.status = "rejected";
    await request.save();

    res.json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const leaveGroup = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    console.log(`[leaveGroup] Starting leave process for clerkId: ${clerkId}`);

    const user = await User.findOne({ clerkId });

    if (!user) {
      console.log(`[leaveGroup] User not found for clerkId: ${clerkId}`);
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mealGroup) {
      console.log(`[leaveGroup] User is not in any meal group`);
      return res.status(400).json({
        message: "You are not in any meal group",
      });
    }

    const group = await MealGroup.findById(user.mealGroup);

    if (!group) {
      console.log(`[leaveGroup] Meal group not found: ${user.mealGroup}`);
      return res.status(404).json({
        message: "Meal group not found",
      });
    }

    await resolveExpiredManagerDelegation(group);
    const freshGroup = await MealGroup.findById(group._id);

    const remainingMembers = (freshGroup.members || []).filter(
      (memberId) => memberId.toString() !== user._id.toString()
    );

    const isOwner = freshGroup.owner?.toString() === user._id.toString();
    const isManager = freshGroup.manager?.toString() === user._id.toString() && freshGroup.owner?.toString() !== user._id.toString();

    if (isOwner && remainingMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You must transfer ownership to another member before leaving the group.",
      });
    }

    if (isManager && remainingMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You must promote a member to manager before leaving the group.",
      });
    }

    const groupName = freshGroup.groupName;

    const activeMembership = await GroupMembership.findOne({
      user: user._id,
      mealGroup: group._id,
      status: "active",
    });

    if (activeMembership) {
      activeMembership.status = "left";
      activeMembership.leftAt = new Date();
      await activeMembership.save();
    }

    if (remainingMembers.length === 0) {
      await GroupMembership.deleteMany({ mealGroup: freshGroup._id });
      await JoinRequest.deleteMany({ mealGroup: freshGroup._id });
      await MealGroup.findByIdAndDelete(freshGroup._id);
    } else {
      freshGroup.members = remainingMembers;

      if (freshGroup.owner?.toString() === user._id.toString()) {
        freshGroup.owner = remainingMembers[0];
      }

      if (freshGroup.manager?.toString() === user._id.toString()) {
        freshGroup.manager = remainingMembers[0];
      }

      await freshGroup.save();
    }

    user.mealGroup = null;
    user.role = "member";
    await user.save();

    await JoinRequest.updateMany(
      { user: user._id, mealGroup: freshGroup._id },
      { status: "rejected" }
    );

    console.log(`[leaveGroup] User ${user._id} successfully left group ${freshGroup._id}`);

    res.json({
      success: true,
      message: remainingMembers.length === 0
        ? `You left the last member slot and the group "${groupName}" was dissolved.`
        : `You have left the group "${groupName}"`,
      groupName,
      dissolved: remainingMembers.length === 0,
    });
  } catch (error) {
    console.log(`[leaveGroup] Error: ${error.message}`);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const transferManager = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { memberId, duration } = req.body;

    const normalizedDuration = normalizeManagerDuration(duration);

    if (!normalizedDuration) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid transfer duration.",
      });
    }

    const currentManager = await User.findOne({ clerkId });

    if (!currentManager || !currentManager.mealGroup) {
      return res.status(404).json({
        success: false,
        message: "Current manager group not found",
      });
    }

    const group = await MealGroup.findById(currentManager.mealGroup);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Meal group not found",
      });
    }

    const nextManager = await User.findById(memberId);

    if (!nextManager) {
      return res.status(404).json({
        success: false,
        message: "Selected member not found",
      });
    }

    if (group.owner?.toString() !== currentManager._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the current owner can appoint a new owner or transfer leadership authority.",
      });
    }

    await transferGroupManager({
      group,
      currentManager,
      nextManager,
      duration: normalizedDuration,
    });

    const payload = await getMealGroupPayloadForUser(currentManager);

    res.json({
      success: true,
      message:
        normalizedDuration === "permanent"
          ? "Manager transferred successfully"
          : `Manager transferred successfully for ${normalizedDuration} days`,
      ...payload,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
