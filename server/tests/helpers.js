/**
 * Shared test helpers: token generation, user creation, etc.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

export const TEST_SECRET = "test_secret_key_for_jest_tests";

// Ensure process.env.SECRET_KEY is set for all tests
process.env.SECRET_KEY = TEST_SECRET;

/**
 * Create a JWT token that the protectRoute middleware will accept.
 * We sign with the same TEST_SECRET that is set in process.env.SECRET_KEY.
 */
export const makeToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, TEST_SECRET, { expiresIn });
};

/**
 * Create and persist a User document, returning { user, token }.
 */
export const createTestUser = async ({
  fullname = "Test User",
  username = "testuser",
  email = "test@example.com",
  password = "password123",
  gender = "male",
} = {}) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullname,
    username,
    email,
    password: hashed,
    gender,
    profilePic: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullname)}`,
  });

  const token = makeToken({
    _id: user._id,
    fullname: user.fullname,
    username: user.username,
    profilePic: user.profilePic,
  });

  return { user, token };
};
