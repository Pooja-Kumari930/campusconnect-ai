import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  listUsers,
  listStaff,
  updateUser,
  changeMyPassword,
} from "../controllers/userController.js";

const router = Router();

router.get("/", protect, authorize("admin"), listUsers);
router.get("/staff", protect, authorize("admin", "staff"), listStaff);
router.patch(
  "/me/password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  ],
  validate,
  changeMyPassword
);
router.patch("/:id", protect, authorize("admin"), updateUser);

export default router;
