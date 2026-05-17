import MealGroup from "../models/MealGroup.js";
import MealEntry from "../models/MealEntry.js";
import User from "../models/User.js";
import generateCode from "../utils/generateCode.js";
import calculateMealRate from "../utils/calculateMealRate.js";

export const getMealGroupPayloadForUser = async (user) => {
  const currentUser = await User.findById(user._id).lean();

  if (!currentUser) {
    return null;
  }

  if (!currentUser.mealGroup) {
    return {
      user: currentUser,
      mealGroup: null,
      members: [],
      entries: [],
    };
  }

  const mealGroup = await MealGroup.findById(currentUser.mealGroup)
    .populate("members", "name email role balance totalMeals")
    .lean();

  if (!mealGroup) {
    return {
      user: currentUser,
      mealGroup: null,
      members: [],
      entries: [],
    };
  }

  const entries = await MealEntry.find({
    mealGroup: mealGroup._id,
  })
    .populate("user", "name email")
    .sort({ date: 1, createdAt: 1 })
    .lean();

  const totalMeals = entries.reduce(
    (sum, entry) => sum + entry.totalMeals,
    0
  );
  const mealRate = calculateMealRate(
    mealGroup.totalExpense,
    totalMeals
  );

  return {
    user: currentUser,
    mealGroup: {
      ...mealGroup,
      totalMeals,
      mealRate,
    },
    members: mealGroup.members,
    entries,
  };
};

export const getMyMealGroup = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const user = await User.findOne({
      clerkId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const payload = await getMealGroupPayloadForUser(user);

    res.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

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

    const payload = await getMealGroupPayloadForUser(user);

    res.status(201).json({
      success: true,
      message: "Meal group created",
      ...payload,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
