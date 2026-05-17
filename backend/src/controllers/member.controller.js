import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import JoinRequest from "../models/JoinRequest.js";


// Join meal group with invite code

export const joinMealGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const clerkId = req.auth.userId;

    const user = await User.findOne({
        clerkId,
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Check already in group
    if (user.mealGroup) {
      return res.status(400).json({
        message: "Already in a meal group",
      });
    }

    // 3. Find meal group by invite code
    const group = await MealGroup.findOne({
      inviteCode,
    });

    if (!group) {
      return res.status(404).json({
        message: "Invalid invite code",
      });
    }

    // 4. Check duplicate request
    const existingRequest =
      await JoinRequest.findOne({
        user: user._id,
        mealGroup: group._id,
      });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    // 5. Create join request
    const request = await JoinRequest.create({
      user: user._id,
      mealGroup: group._id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Join request sent",
      request,
    });
  } catch (error) {
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