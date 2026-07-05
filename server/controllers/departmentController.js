import Department from "../models/Department.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort("name");
  res.json(new ApiResponse(200, { departments }));
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json(new ApiResponse(201, { department }, "Department created."));
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, "Department not found.");
  res.json(new ApiResponse(200, { department }, "Department updated."));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!department) throw new ApiError(404, "Department not found.");
  res.json(new ApiResponse(200, null, "Department deactivated."));
});
