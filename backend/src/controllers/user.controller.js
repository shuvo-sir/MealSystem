import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { clerkId, name, email } = req.body;

    const existingUser = await User.findOne({
      clerkId,
    });

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
    res.status(500).json({
      message: error.message,
    });
  }
};