import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { clerkId, name, email } = req.body;

    // ✅ VALIDATION ADDED
    if (!clerkId || !name || !email) {
      return res.status(400).json({
        message: "Missing required fields",
        received: req.body,
      });
    }

    const existingUser = await User.findOne({ clerkId });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const user = await User.create({
      clerkId,
      name,
      email,
    });

    res.status(201).json(user);
  } catch (error) {
    console.log("CREATE USER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const user = await User.findOne({
      clerkId,
    }).populate("mealGroup");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
    logger.error("Error fetching current user:", error);
  }
};
