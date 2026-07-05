import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("A valid email is required.")],
  validate,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")],
  validate,
  resetPassword
);

export default router;
