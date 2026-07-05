import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/generateTokens.js";
import User from "../models/User.js";

/** Verifies the access token and attaches the authenticated user to req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Account not found or deactivated.");
  }

  req.user = user;
  next();
});

/** Restricts a route to one or more roles, e.g. authorize("admin", "staff"). */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
  next();
};
