// utils/jwt.utils.js — Centralised JWT sign & verify helpers
// feature: All JWT logic in one place — controllers never import jsonwebtoken directly
import jwt from "jsonwebtoken";

/**
 * Signs a JWT token with the given payload.
 * @param {object} payload - Data to encode (e.g. { id, role, name })
 * @returns {string} Signed JWT string
 */
export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verifies and decodes a JWT token.
 * @param {string} token - JWT string from Authorization header
 * @returns {object} Decoded payload
 * @throws Will throw if token is invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
