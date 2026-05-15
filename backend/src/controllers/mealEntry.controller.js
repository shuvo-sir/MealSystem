import MealEntry from "../models/MealEntry.js";
import User from "../models/User.js";

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