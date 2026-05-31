import MealGroup from "../models/MealGroup.js";
import MealEntry from "../models/MealEntry.js";
import calculateMealRate from "./calculateMealRate.js";
import mongoose from "mongoose";

/**
 * Atomic operations for updating group financials
 * Prevents race conditions and data corruption from concurrent updates
 */

/**
 * Atomically update group financials (expense + meal rate)
 * @param {String} groupId - The group ID
 * @param {Number} expenseChange - Amount to add/subtract from totalExpense
 * @param {Number} mealChange - Amount to add/subtract from totalMeals (optional)
 * @returns {Promise<Object>} Updated group object
 */
const updateGroupFinancials = async (groupId, expenseChange = 0, mealChange = 0) => {
  try {
    // Build update object with atomic operators
    const updateObj = {};
    
    if (expenseChange !== 0) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalExpense = expenseChange;
    }
    
    if (mealChange !== 0) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalMeals = mealChange;
    }

    // If no changes, just return current group
    if (Object.keys(updateObj).length === 0) {
      return await MealGroup.findById(groupId);
    }

    // Perform atomic update
    const updatedGroup = await MealGroup.findByIdAndUpdate(
      groupId,
      updateObj,
      { new: true, runValidators: false } // new: true returns updated doc
    );

    // Now recalculate meal rate based on new totals
    if (updatedGroup) {
      const mealRateResult = await recalculateMealRateAtomic(groupId);
      return mealRateResult;
    }

    return updatedGroup;
  } catch (error) {
    console.error('[atomicOperations] updateGroupFinancials error:', error.message);
    throw error;
  }
};

/**
 * Atomically recalculate and update meal rate
 * Uses aggregation to get accurate totals, then updates rate
 * @param {String} groupId - The group ID
 * @returns {Promise<Object>} Updated group with new mealRate
 */
const recalculateMealRateAtomic = async (groupId) => {
  try {
    // Get current totals
    const group = await MealGroup.findById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Get aggregated meal totals for accuracy
    const mealTotals = await MealEntry.aggregate([
      { $match: { mealGroup: new mongoose.Types.ObjectId(groupId) } },
      {
        $group: {
          _id: '$mealGroup',
          totalMeals: { $sum: '$totalMeals' },
        },
      },
    ]);

    const groupMealTotal = mealTotals[0]?.totalMeals || 0;
    const newMealRate = calculateMealRate(group.totalExpense, groupMealTotal);

    // Atomically update only the mealRate field
    const updatedGroup = await MealGroup.findByIdAndUpdate(
      groupId,
      { mealRate: newMealRate },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    console.error('[atomicOperations] recalculateMealRateAtomic error:', error.message);
    throw error;
  }
};

/**
 * Atomically add a deposit to user balance
 * @param {String} userId - The user ID
 * @param {Number} amount - Amount to add to balance
 * @returns {Promise<Object>} Updated user
 */
const addUserBalance = async (userId, amount) => {
  try {
    const User = require('../models/User');
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('[atomicOperations] addUserBalance error:', error.message);
    throw error;
  }
};

/**
 * Atomically update group total meals
 * @param {String} groupId - The group ID
 * @param {Number} mealCount - Number of meals to add/subtract
 * @returns {Promise<Object>} Updated group
 */
const updateGroupTotalMeals = async (groupId, mealCount) => {
  try {
    const updatedGroup = await MealGroup.findByIdAndUpdate(
      groupId,
      { $inc: { totalMeals: mealCount } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    console.error('[atomicOperations] updateGroupTotalMeals error:', error.message);
    throw error;
  }
};

/**
 * Atomically update group total expense
 * @param {String} groupId - The group ID
 * @param {Number} expenseAmount - Amount to add/subtract
 * @returns {Promise<Object>} Updated group
 */
const updateGroupTotalExpense = async (groupId, expenseAmount) => {
  try {
    const updatedGroup = await MealGroup.findByIdAndUpdate(
      groupId,
      { $inc: { totalExpense: expenseAmount } },
      { new: true }
    );

    return updatedGroup;
  } catch (error) {
    console.error('[atomicOperations] updateGroupTotalExpense error:', error.message);
    throw error;
  }
};

export {
  updateGroupFinancials,
  recalculateMealRateAtomic,
  addUserBalance,
  updateGroupTotalMeals,
  updateGroupTotalExpense,
};
