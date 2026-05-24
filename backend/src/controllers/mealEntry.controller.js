import MealEntry from "../models/MealEntry.js";
import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import calculateMealRate from "../utils/calculateMealRate.js";

export const addMealEntry = async (
  req,
  res
) => {
  try {
    const {
      userId,
      date,
      breakfast,
      lunch,
      dinner,
      note,
    } = req.body;

    // find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // must join group first
    if (!user.mealGroup) {
      return res.status(400).json({
        message:
          "Join meal group first",
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
        message:
          "Meal already added for this date",
      });
    }

    // calculate total
    const totalMeals =
      breakfast + lunch + dinner;

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
        note,
      });

    // update user total meals
    user.totalMeals += totalMeals;

    await user.save();

    const groupMealTotals = await MealEntry.aggregate([
      {
        $match: {
          mealGroup: user.mealGroup,
        },
      },
      {
        $group: {
          _id: "$mealGroup",
          totalMeals: { $sum: "$totalMeals" },
        },
      },
    ]);

    const group = await MealGroup.findById(user.mealGroup);

    if (group) {
      group.mealRate = calculateMealRate(
        group.totalExpense,
        groupMealTotals[0]?.totalMeals || 0
      );
      await group.save();
    }

    res.status(201).json({
      success: true,
      message:
        "Meal entry added successfully",
      entry,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
    const { groupId, userId, startDate, endDate, mealType } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        message: "groupId is required",
      });
    }

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

    let entries = await MealEntry.find(filter)
      .populate("user", "name email")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Filter by meal type if specified
    if (mealType && mealType !== "all") {
      entries = entries.filter((entry) => {
        if (mealType === "breakfast") return entry.breakfast > 0;
        if (mealType === "lunch") return entry.lunch > 0;
        if (mealType === "dinner") return entry.dinner > 0;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      message: "Meal history retrieved",
      entries,
      count: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
        message: "Meal entry not found",
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

    // Update user totalMeals
    const user = await User.findById(entry.user);
    if (user) {
      user.totalMeals = user.totalMeals - oldTotalMeals + entry.totalMeals;
      await user.save();
    }

    // Recalculate meal rate
    const groupMealTotals = await MealEntry.aggregate([
      {
        $match: {
          mealGroup: entry.mealGroup,
        },
      },
      {
        $group: {
          _id: "$mealGroup",
          totalMeals: { $sum: "$totalMeals" },
        },
      },
    ]);

    const group = await MealGroup.findById(entry.mealGroup);
    if (group) {
      group.mealRate = calculateMealRate(
        group.totalExpense,
        groupMealTotals[0]?.totalMeals || 0
      );
      await group.save();
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
      message: error.message,
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
        message: "Meal entry not found",
      });
    }

    const oldTotalMeals = entry.totalMeals;

    // Update user totalMeals
    const user = await User.findById(entry.user);
    if (user) {
      user.totalMeals = Math.max(0, user.totalMeals - oldTotalMeals);
      await user.save();
    }

    // Delete entry
    await MealEntry.findByIdAndDelete(entryId);

    // Recalculate meal rate
    const groupMealTotals = await MealEntry.aggregate([
      {
        $match: {
          mealGroup: entry.mealGroup,
        },
      },
      {
        $group: {
          _id: "$mealGroup",
          totalMeals: { $sum: "$totalMeals" },
        },
      },
    ]);

    const group = await MealGroup.findById(entry.mealGroup);
    if (group) {
      group.mealRate = calculateMealRate(
        group.totalExpense,
        groupMealTotals[0]?.totalMeals || 0
      );
      await group.save();
    }

    res.status(200).json({
      success: true,
      message: "Meal entry deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
