import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = Router();

router.get("/", protect, listCategories);
router.post(
  "/",
  protect,
  authorize("admin"),
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validate,
  createCategory
);
router.patch("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
