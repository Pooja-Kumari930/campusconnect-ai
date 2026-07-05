import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { upload } from "../config/multer.js";
import {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
  assignComplaint,
  addComment,
  submitFeedback,
  deleteComplaint,
  getAnalyticsSummary,
} from "../controllers/complaintController.js";
import { COMPLAINT_STATUSES } from "../models/Complaint.js";

const router = Router();

router.use(protect); // every complaint route requires authentication

router.get("/analytics/summary", authorize("staff", "admin"), getAnalyticsSummary);

router.post(
  "/",
  authorize("student"),
  upload.array("attachments", 5),
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("description").trim().notEmpty().withMessage("Description is required."),
    body("category").notEmpty().withMessage("Category is required."),
  ],
  validate,
  createComplaint
);

router.get("/", listComplaints);
router.get("/:id", getComplaint);

router.patch(
  "/:id/status",
  authorize("staff", "admin"),
  [body("status").isIn(COMPLAINT_STATUSES).withMessage("Invalid status.")],
  validate,
  updateComplaintStatus
);

router.patch(
  "/:id/assign",
  authorize("admin"),
  [body("staffId").notEmpty().withMessage("staffId is required.")],
  validate,
  assignComplaint
);

router.post(
  "/:id/comments",
  [body("message").trim().notEmpty().withMessage("Message is required.")],
  validate,
  addComment
);

router.post(
  "/:id/feedback",
  authorize("student"),
  [body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5.")],
  validate,
  submitFeedback
);

router.delete("/:id", authorize("admin"), deleteComplaint);

export default router;
