import User from "../models/User.js";

export const createUser = async (req,res)=>{

  console.log("=== CREATE USER HIT ===");
  console.log("Body:", req.body);
  console.log("Auth:", req.auth);

  try{

      const clerkId =
      req.auth?.userId ||
      req.body.clerkId;

      const {name,email} =
      req.body;

      // Validation
      if (!clerkId) {
        console.error("❌ MISSING CLERK ID");
        return res.status(400).json({
          success: false,
          message: "clerkId is required",
          received: { clerkId, name, email }
        });
      }

      if (!name || !email) {
        console.error("❌ MISSING NAME OR EMAIL");
        return res.status(400).json({
          success: false,
          message: "name and email are required",
          received: { clerkId, name, email }
        });
      }

      console.log(
        "✓ CREATING USER WITH:",
        { clerkId, name, email }
      );

      const existingUser =
      await User.findOne({
          clerkId
      });

      if (existingUser) {

          console.log(
            "✓ USER ALREADY EXISTS"
          );

          return res
            .status(200)
            .json(existingUser);
      }

      const user =
      await User.create({
          clerkId,
          name,
          email
      });

      console.log(
        "✓ USER SAVED:",
        user
      );

      return res
      .status(201)
      .json(user);

  } catch(error){

      console.error(
        "❌ CREATE USER ERROR:"
      );
      
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
      console.error("Error Code:", error.code);
      console.error("Full Error:", error);

      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(409).json({
          success: false,
          message: `${field} already exists`,
          error: error.message,
          code: 11000
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: messages
        });
      }

      return res
      .status(500)
      .json({
          success: false,
          message: error.message || "Failed to create user",
          error: error.name,
          code: error.code
      });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    console.log(`[getCurrentUser] Fetching user with clerkId: ${clerkId}`);

    const user = await User.findOne({
      clerkId,
    }).populate("mealGroup");

    if (!user) {
      console.log(`[getCurrentUser] User not found for clerkId: ${clerkId}`);
      return res.status(404).json({
        message: "User not found",
        found: false,
        clerkId,
      });
    }

    console.log(`[getCurrentUser] User found: ${user._id}`);

    res.json({
      success: true,
      found: true,
      user,
      clerkId,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Diagnostic endpoint for troubleshooting auth issues
export const debugMe = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    console.log(`[debugMe] Auth userId: ${clerkId}`);

    const user = await User.findOne({ clerkId });

    const response = {
      timestamp: new Date().toISOString(),
      clerkId,
      found: !!user,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mealGroup: user.mealGroup,
      } : null,
    };

    console.log(`[debugMe] Response:`, response);

    res.json(response);
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
