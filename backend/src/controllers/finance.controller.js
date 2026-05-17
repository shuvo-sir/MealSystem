import Deposit from "../models/Deposit.js";
import Expense from "../models/Expense.js";
import MealEntry from "../models/MealEntry.js";
import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";
import calculateMealRate from "../utils/calculateMealRate.js";


// ==============================
// ADD DEPOSIT
// ==============================

export const addDeposit = async (
  req,
  res
) => {
  try {
    const { userId, amount, note } =
      req.body;

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mealGroup) {
      return res.status(400).json({
        message:
          "Join meal group first",
      });
    }

    const deposit =
      await Deposit.create({
        user: user._id,
        mealGroup: user.mealGroup,
        amount,
        note,
      });

    // update user balance
    user.balance += amount;

    await user.save();

    // update group deposit
    const group =
      await MealGroup.findById(
        user.mealGroup
      );

    group.totalDeposit += amount;

    await group.save();

    res.status(201).json({
      success: true,
      message: "Deposit added",
      deposit,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ==============================
// ADD EXPENSE
// ==============================

export const addExpense = async (
  req,
  res
) => {
  try {
    const {
      userId,
      title,
      amount,
      note,
    } = req.body;

    const user = await User.findById(
      userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // only manager can add expense
    if (user.role !== "manager") {
      return res.status(403).json({
        message:
          "Only manager can add expense",
      });
    }

    const expense =
      await Expense.create({
        mealGroup: user.mealGroup,
        addedBy: user._id,
        title,
        amount,
        note,
      });

    // update meal group expense
    const group =
      await MealGroup.findById(
        user.mealGroup
      );

    group.totalExpense += amount;
    const groupMealTotals = await MealEntry.aggregate([
      {
        $match: {
          mealGroup: group._id,
        },
      },
      {
        $group: {
          _id: "$mealGroup",
          totalMeals: { $sum: "$totalMeals" },
        },
      },
    ]);
    group.mealRate = calculateMealRate(
      group.totalExpense,
      groupMealTotals[0]?.totalMeals || 0
    );

    await group.save();

    res.status(201).json({
      success: true,
      message: "Expense added",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
