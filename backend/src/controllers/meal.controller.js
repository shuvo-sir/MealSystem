import MealGroup from "../models/MealGroup.js";
import MealEntry from "../models/MealEntry.js";
import User from "../models/User.js";
import generateCode from "../utils/generateCode.js";
import calculateMealRate from "../utils/calculateMealRate.js";


// Get meal group details for current user

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
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      console.log("[getMyMealGroup] Not authenticated - no clerkId");
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log(`[getMyMealGroup] Fetching meal group for clerkId: ${clerkId}`);

    let user = await User.findOne({ clerkId });

    // Auto-create user if not found (fallback for sync issues)
    if (!user) {
      console.log(`[getMyMealGroup] User not found for clerkId: ${clerkId}. Creating user...`);
      
      try {
        user = new User({
          clerkId,
          name: `User_${clerkId.substring(0, 8)}`,
          email: `${clerkId}@mealapp.local`,
          role: "member",
          balance: 0,
          totalMeals: 0,
        });

        await user.save();
        console.log(`[getMyMealGroup] User created successfully: ${user._id}`);
      } catch (createError) {
        console.log(`[getMyMealGroup] Error creating user: ${createError.message}`);
        return res.status(500).json({
          message: "Failed to create user account",
        });
      }
    }

    const payload = await getMealGroupPayloadForUser(user);

    console.log(`[getMyMealGroup] Successfully retrieved meal group data for user: ${user._id}`);

    return res.json({
      success: true,
      ...payload,
    });

  } catch (err) {
    console.log(`[getMyMealGroup] Error: ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};


// Create meal group with unique invite code
export const createMealGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      console.log("[createMealGroup] Not authenticated - no clerkId");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    console.log(`[createMealGroup] Creating group for clerkId: ${clerkId}, groupName: ${groupName}`);

    let user = await User.findOne({ clerkId });

    // Auto-create user if not found (fallback for sync issues)
    if (!user) {
      console.log(`[createMealGroup] User not found for clerkId: ${clerkId}. Creating user...`);
      
      try {
        user = new User({
          clerkId,
          name: `User_${clerkId.substring(0, 8)}`,
          email: `${clerkId}@mealapp.local`,
          role: "member",
          balance: 0,
          totalMeals: 0,
        });

        await user.save();
        console.log(`[createMealGroup] User created successfully: ${user._id}`);
      } catch (createError) {
        console.log(`[createMealGroup] Error creating user: ${createError.message}`);
        return res.status(500).json({
          success: false,
          message: "Failed to create user account",
        });
      }
    }

    if (user.mealGroup) {
      console.log(`[createMealGroup] User already in group: ${user.mealGroup}`);
      return res.status(400).json({
        success: false,
        message: "User already belongs to a meal group",
      });
    }

    const inviteCode = generateCode();

    const mealGroup = await MealGroup.create({
      groupName,
      inviteCode,
      manager: user._id,
      members: [user._id],
    });

    user.role = "manager";
    user.mealGroup = mealGroup._id;

    await user.save();

    console.log(`[createMealGroup] Meal group created successfully: ${mealGroup._id}`);

    const payload = await getMealGroupPayloadForUser(user);

    return res.status(201).json({
      success: true,
      message: "Meal group created",
      ...payload,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
