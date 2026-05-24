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

// ==============================
// GET TRANSACTIONS
// ==============================

export const getTransactions = async (
  req,
  res
) => {
  try {
    const { groupId, startDate, endDate } = req.query;

    if (!groupId) {
      return res.status(400).json({
        message: "groupId is required",
      });
    }

    const filter = { mealGroup: groupId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch deposits
    const deposits = await Deposit.find(filter)
      .populate("user", "name email")
      .lean();

    // Fetch expenses
    const expenses = await Expense.find(filter)
      .populate("addedBy", "name email")
      .lean();

    // Combine and format
    const transactions = [
      ...deposits.map((d) => ({
        _id: d._id,
        type: "deposit",
        amount: d.amount,
        date: d.createdAt,
        user: d.user,
        note: d.note,
      })),
      ...expenses.map((e) => ({
        _id: e._id,
        type: "expense",
        amount: e.amount,
        date: e.createdAt,
        title: e.title,
        user: e.addedBy,
        note: e.note,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      message: "Transactions retrieved",
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// GET EXPENSE HISTORY
// ==============================

export const getExpenseHistory = async (
  req,
  res
) => {
  try {
    const { groupId, addedBy, startDate, endDate } = req.query;

    if (!groupId) {
      return res.status(400).json({
        message: "groupId is required",
      });
    }

    const filter = { mealGroup: groupId };

    if (addedBy) {
      filter.addedBy = addedBy;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(filter)
      .populate("addedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Expense history retrieved",
      expenses,
      count: expenses.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
