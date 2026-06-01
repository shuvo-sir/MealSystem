import MealEntry from "../models/MealEntry.js";
import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import calculateMealRate from "../utils/calculateMealRate.js";
import { recalculateMealRateAtomic, updateGroupTotalMeals } from "../utils/atomicOperations.js";

export const addMealEntry = async (
  req,
  res
) => {
  try {
    const {
      date,
      breakfast,
      lunch,
      dinner,
      note,
    } = req.body;
    const clerkId = req.auth?.userId;

    // find user
    const user = await User.findOne({ clerkId });
    const userId = user._id;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // must join group first
    if (!user.mealGroup) {
      return res.status(400).json({
        success: false,
        message:
          "Join meal group first",
        code: "NO_MEAL_GROUP",
      });
    }

    // check existing entry
    const existing =
      await MealEntry.findOne({
        user: userId,
        date,
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Meal already added for this date",
        code: "DUPLICATE_ENTRY",
      });
    }

    // calculate total
    const totalMeals =
      breakfast + lunch + dinner;

    // Get current meal rate from group
    const group = await MealGroup.findById(user.mealGroup);
    const mealRateAtCreation = group?.mealRate || 0;

    // create entry
    const entry =
      await MealEntry.create({
        user: userId,
        mealGroup: user.mealGroup,
        date,
        breakfast,
        lunch,
        dinner,
        totalMeals,
        mealRateAtCreation,
        note,
      });

    // Use atomic operation to update user total meals
    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalMeals } }
    );

    // Use atomic operation to update group total meals and recalculate rate
    await updateGroupTotalMeals(user.mealGroup, totalMeals);
    await recalculateMealRateAtomic(user.mealGroup);

    res.status(201).json({
      success: true,
      message:
        "Meal entry added successfully",
      entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};

// ==============================
// GET MEAL HISTORY
// ==============================

export const getMealHistory = async (
  req,
  res
) => {
  try {
    const { groupId, userId, startDate, endDate, mealType, page = 0, limit = 50 } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "groupId is required",
        code: "MISSING_PARAM",
      });
    }

    const pageNum = Math.max(0, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per request
    const skip = pageNum * limitNum;

    const filter = { mealGroup: groupId };

    if (userId) {
      filter.user = userId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = startDate;
      }
      if (endDate) {
        filter.date.$lte = endDate;
      }
    }

    let query = MealEntry.find(filter)
      .populate("user", "name email")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const entries = await query.exec();

    // Get total count for pagination
    const total = await MealEntry.countDocuments(filter);

    // Filter by meal type if specified
    const filtered = mealType && mealType !== "all" 
      ? entries.filter((entry) => {
          if (mealType === "breakfast") return entry.breakfast > 0;
          if (mealType === "lunch") return entry.lunch > 0;
          if (mealType === "dinner") return entry.dinner > 0;
          return true;
        })
      : entries;

    res.status(200).json({
      success: true,
      message: "Meal history retrieved",
      entries: filtered,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};

// ==============================
// UPDATE MEAL ENTRY
// ==============================

export const updateMealEntry = async (
  req,
  res
) => {
  try {
    const { entryId } = req.params;
    const { breakfast, lunch, dinner, note } = req.body;

    const entry = await MealEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Meal entry not found",
        code: "NOT_FOUND",
      });
    }

    // Verify ownership - user can only edit their own entries
    const clerkId = req.auth?.userId;
    const user = await User.findOne({ clerkId });

    if (!user || entry.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own meal entries",
        code: "FORBIDDEN",
      });
    }

    const oldTotalMeals = entry.totalMeals;

    // Update fields
    if (breakfast !== undefined) entry.breakfast = breakfast;
    if (lunch !== undefined) entry.lunch = lunch;
    if (dinner !== undefined) entry.dinner = dinner;
    if (note !== undefined) entry.note = note;

    // Recalculate total
    entry.totalMeals = entry.breakfast + entry.lunch + entry.dinner;

    await entry.save();

    // Update user totalMeals atomically
    const mealDifference = entry.totalMeals - oldTotalMeals;
    if (mealDifference !== 0) {
      await User.findByIdAndUpdate(
        entry.user,
        { $inc: { totalMeals: mealDifference } }
      );

      // Recalculate meal rate
      await recalculateMealRateAtomic(entry.mealGroup);
    }

    const updatedEntry = await MealEntry.findById(entryId)
      .populate("user", "name email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Meal entry updated",
      entry: updatedEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};

// ==============================
// DELETE MEAL ENTRY
// ==============================

export const deleteMealEntry = async (
  req,
  res
) => {
  try {
    const { entryId } = req.params;

    const entry = await MealEntry.findById(entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Meal entry not found",
        code: "NOT_FOUND",
      });
    }

    // Verify ownership - user can only delete their own entries
    const clerkId = req.auth?.userId;
    const user = await User.findOne({ clerkId });

    if (!user || entry.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own meal entries",
        code: "FORBIDDEN",
      });
    }

    const oldTotalMeals = entry.totalMeals;

    // Update user totalMeals atomically
    await User.findByIdAndUpdate(
      entry.user,
      { $inc: { totalMeals: -oldTotalMeals } }
    );

    // Delete entry
    await MealEntry.findByIdAndDelete(entryId);

    // Recalculate meal rate
    await recalculateMealRateAtomic(entry.mealGroup);

    res.status(200).json({
      success: true,
      message: "Meal entry deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_ERROR",
    });
  }
};
