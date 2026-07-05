import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// @route GET /api/users  (admin only)
export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query)
      .populate("department", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json(
    new ApiResponse(200, {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});

// @route GET /api/users/staff  (for assignment dropdowns)
export const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: "staff", isActive: true }).select("name email department").populate("department", "name");
  res.json(new ApiResponse(200, { staff }));
});

// @route PATCH /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "avatarUrl", "department", "role", "isActive"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  // Only an admin may change role or active status of another account.
  if ((updates.role || updates.isActive !== undefined) && req.user.role !== "admin") {
    delete updates.role;
    delete updates.isActive;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found.");
  res.json(new ApiResponse(200, { user: user.toSafeObject() }, "User updated."));
});

// @route PATCH /api/users/me/password
export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect.");
  }
  user.password = newPassword;
  await user.save();
  res.json(new ApiResponse(200, null, "Password changed successfully."));
});
