import crypto from "crypto";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateTokens.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/auth",
};

const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  // Only students may self-register with a role; staff/admin accounts are provisioned by an admin.
  const safeRole = role === "student" || !role ? "student" : "student";

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    emailVerificationToken,
  });

  const accessToken = await issueTokens(res, user);

  // In production this token would be emailed via a transactional email service.
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: user.toSafeObject(), accessToken },
        "Registered successfully."
      )
    );
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated. Contact an administrator.");
  }

  const accessToken = await issueTokens(res, user);

  res.json(
    new ApiResponse(200, { user: user.toSafeObject(), accessToken }, "Logged in successfully.")
  );
});

// @route POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided.");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Refresh token invalid or expired. Please log in again.");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Refresh token invalid. Please log in again.");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  res.json(new ApiResponse(200, { accessToken }, "Token refreshed."));
});

// @route POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json(new ApiResponse(200, null, "Logged out successfully."));
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user.toSafeObject() }, "Current user fetched."));
});

// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way so we don't leak which emails are registered.
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });
    // In production: email a link containing resetToken to the user.
  }

  res.json(
    new ApiResponse(200, null, "If that email is registered, a reset link has been sent.")
  );
});

// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired.");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json(new ApiResponse(200, null, "Password reset successfully. You can now log in."));
});
