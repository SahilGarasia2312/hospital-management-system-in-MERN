// modules/auth/auth.service.js — Pure business logic for authentication
// No Express req/res here — services are framework-agnostic and unit-testable
import User from "../../models/user.model.js";
import { signToken } from "../../utils/jwt.utils.js";

/**
 * Registers a new user (admin-only action).
 * Creates user with hashed password (handled by pre-save hook in User model).
 *
 * @param {object} userData - { name, email, password, role, linkedId?, linkedModel? }
 * @returns {object} Newly created user (without password) + signed JWT
 */
export const registerUser = async (userData) => {
  const { name, email, password, role, linkedId, linkedModel } = userData;

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Create user — password hashing is done in the pre-save hook
  const user = await User.create({ name, email, password, role, linkedId, linkedModel });

  // Sign JWT with role included — frontend uses this for role-based routing
  const token = signToken({ id: user._id, role: user.role, name: user.name, email: user.email });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Logs in a user by verifying email + password.
 *
 * @param {string} email
 * @param {string} password - Plain-text password to compare against hash
 * @returns {object} Signed JWT + user info
 */
export const loginUser = async (email, password) => {
  // Must select password explicitly (it's select: false in schema)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Use the instance method defined on the User model
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user._id, role: user.role, name: user.name, email: user.email });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedId: user.linkedId,
    },
  };
};

/**
 * Returns the currently logged-in user's profile (from req.user id).
 * @param {string} userId - MongoDB ObjectId from JWT payload
 */
export const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};
