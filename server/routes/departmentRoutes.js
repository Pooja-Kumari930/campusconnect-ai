import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = Router();

router.get("/", protect, listDepartments);
router.post(
  "/",
  protect,
  authorize("admin"),
  [body("name").trim().notEmpty().withMessage("Department name is required.")],
  validate,
  createDepartment
);
router.patch("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

export default router;
