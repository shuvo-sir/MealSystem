import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import generateCode from "../utils/generateCode.js";



// Create meal group with unique invite code
export const createMealGroup = async (
  req,
  res
) => {
  try {
    const { groupName } = req.body;

    // get clerk user id
    const clerkId = req.auth.userId;

    // find mongodb user
    const user =
      await User.findOne({
        clerkId,
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if already in meal group
    if (user.mealGroup) {
      return res.status(400).json({
        message:
          "User already belongs to a meal group",
      });
    }

    // Generate invite code
    const inviteCode = generateCode();

    // Create meal group
    const mealGroup = await MealGroup.create({
      groupName,
      inviteCode,
      manager: user._id,
      members: [user._id],
    });

    // Update user
    user.role = "manager";
    user.mealGroup = mealGroup._id;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Meal group created",
      mealGroup,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};