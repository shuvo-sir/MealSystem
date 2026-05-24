import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import JoinRequest from "../models/JoinRequest.js";
import { getMealGroupPayloadForUser } from "./meal.controller.js";


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

    user.mealGroup = group._id;
    await user.save();

    const isMember = group.members.some(
      (member) => member.toString() === user._id.toString()
    );

    if (!isMember) {
      group.members.push(user._id);
      await group.save();
    }

    await JoinRequest.findOneAndUpdate(
      {
        user: user._id,
        mealGroup: group._id,
      },
      {
        status: "accepted",
      }
    );

    console.log(`[joinMealGroup] User successfully joined group: ${group._id}`);

    const payload = await getMealGroupPayloadForUser(user);

    res.status(201).json({
      success: true,
      message: "Meal group joined",
      ...payload,
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

    // add user to group
    user.mealGroup = group._id;
    await user.save();

    group.members.push(user._id);
    await group.save();

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
