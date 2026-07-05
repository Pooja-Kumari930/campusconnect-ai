import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate("department", "name")
    .sort("name");
  res.json(new ApiResponse(200, { categories }));
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(new ApiResponse(201, { category }, "Category created."));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found.");
  res.json(new ApiResponse(200, { category }, "Category updated."));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!category) throw new ApiError(404, "Category not found.");
  res.json(new ApiResponse(200, null, "Category deactivated."));
});
