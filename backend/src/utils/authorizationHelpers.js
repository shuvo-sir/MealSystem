import User from "../models/User.js";
import MealGroup from "../models/MealGroup.js";

/**
 * Authorization helper utilities
 * Provides reusable authorization checks for controllers
 */

/**
 * Check if user is the manager of a specific group
 * @param {String} userId - User ID to check
 * @param {String} groupId - Group ID to check
 * @returns {Promise<Boolean>} True if user is manager
 */
const isGroupManager = async (userId, groupId) => {
  try {
    const group = await MealGroup.findById(groupId).select('manager');
    return group && group.manager.toString() === userId.toString();
  } catch (error) {
    console.error('[authorizationHelpers] isGroupManager error:', error.message);
    return false;
  }
};

/**
 * Check if user is a member of a specific group
 * @param {String} userId - User ID to check
 * @param {String} groupId - Group ID to check
 * @returns {Promise<Boolean>} True if user is member
 */
const isMemberOfGroup = async (userId, groupId) => {
  try {
    const group = await MealGroup.findById(groupId).select('members');
    if (!group) return false;
    
    return group.members.some(memberId => memberId.toString() === userId.toString());
  } catch (error) {
    console.error('[authorizationHelpers] isMemberOfGroup error:', error.message);
    return false;
  }
};

/**
 * Check if user owns a specific resource (by checking resource.user field)
 * @param {String} userId - User ID to check
 * @param {Object} resource - Resource object with 'user' field
 * @returns {Boolean} True if user owns resource
 */
const isResourceOwner = (userId, resource) => {
  if (!resource || !resource.user) {
    return false;
  }
  
  return resource.user.toString() === userId.toString();
};

/**
 * Get the current user from database using clerkId
 * @param {String} clerkId - Clerk user ID
 * @returns {Promise<Object|null>} User object or null
 */
const getCurrentUser = async (clerkId) => {
  try {
    const user = await User.findOne({ clerkId });
    return user;
  } catch (error) {
    console.error('[authorizationHelpers] getCurrentUser error:', error.message);
    return null;
  }
};

/**
 * Check if user is in a group (manager or member)
 * @param {String} userId - User ID to check
 * @param {String} groupId - Group ID to check
 * @returns {Promise<Boolean>} True if user is in group
 */
const isUserInGroup = async (userId, groupId) => {
  try {
    const isManager = await isGroupManager(userId, groupId);
    if (isManager) return true;
    
    const isMember = await isMemberOfGroup(userId, groupId);
    return isMember;
  } catch (error) {
    console.error('[authorizationHelpers] isUserInGroup error:', error.message);
    return false;
  }
};

/**
 * Get user's role in a group
 * @param {String} userId - User ID
 * @param {String} groupId - Group ID
 * @returns {Promise<String>} 'manager', 'member', or 'none'
 */
const getUserRoleInGroup = async (userId, groupId) => {
  try {
    const isManager = await isGroupManager(userId, groupId);
    if (isManager) return 'manager';
    
    const isMember = await isMemberOfGroup(userId, groupId);
    if (isMember) return 'member';
    
    return 'none';
  } catch (error) {
    console.error('[authorizationHelpers] getUserRoleInGroup error:', error.message);
    return 'none';
  }
};

/**
 * Middleware factory for manager-only routes
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next
 * @returns {void}
 */
const requireGroupManager = async (req, res, next) => {
  try {
    const user = req.user || await getCurrentUser(req.auth.userId);
    
    if (!user || !user.mealGroup) {
      return res.status(403).json({
        success: false,
        message: 'User not in a group',
        code: 'FORBIDDEN',
      });
    }

    const isManager = await isGroupManager(user._id, user.mealGroup);
    
    if (!isManager) {
      return res.status(403).json({
        success: false,
        message: 'Only group manager can perform this action',
        code: 'FORBIDDEN',
      });
    }

    next();
  } catch (error) {
    console.error('[authorizationHelpers] requireGroupManager error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      code: 'INTERNAL_ERROR',
    });
  }
};

export {
  isGroupManager,
  isMemberOfGroup,
  isResourceOwner,
  getCurrentUser,
  isUserInGroup,
  getUserRoleInGroup,
  requireGroupManager,
};
