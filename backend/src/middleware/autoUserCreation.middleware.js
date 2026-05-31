import User from "../models/User.js";

/**
 * Middleware to automatically create user in database if they don't exist
 * This ensures Clerk auth is synced with MongoDB User collection
 */
const autoUserCreation = async (req, res, next) => {
  try {
    // Skip for unauthenticated routes
    if (!req.auth || !req.auth.userId) {
      return next();
    }

    const clerkId = req.auth.userId;
    
    // Check if user exists in database
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Try to get user details from Clerk token claims
      // These are available in req.auth object
      const primaryEmailAddress = req.auth.claims?.email || '';
      const firstName = req.auth.claims?.given_name || '';
      const lastName = req.auth.claims?.family_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || `User_${clerkId.substring(0, 8)}`;

      // Create new user with Clerk information
      user = new User({
        clerkId,
        name: fullName,
        email: primaryEmailAddress || `${clerkId}@mealapp.local`,
        role: 'member',
        balance: 0,
        totalMeals: 0,
      });

      await user.save();
      console.log(`[AutoUserCreation] Created new user: ${clerkId}`);
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('[AutoUserCreation] Error:', error.message);
    // Don't block request if auto-creation fails, but log it
    next();
  }
};

export default autoUserCreation;
