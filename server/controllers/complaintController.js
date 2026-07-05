import Complaint from "../models/Complaint.js";
import Comment from "../models/Comment.js";
import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const generateComplaintCode = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });
  return `CC-${year}-${String(count + 1).padStart(5, "0")}`;
};

const emitToUser = (req, userId, event, payload) => {
  const io = req.app.get("io");
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

// @route POST /api/complaints  (student)
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(400, "Invalid category selected.");

  const attachments = (req.files || []).map((f) => ({
    url: `/uploads/${f.filename}`,
    fileName: f.originalname,
    fileType: f.mimetype,
  }));

  const complaint = await Complaint.create({
    complaintCode: await generateComplaintCode(),
    title,
    description,
    category,
    department: categoryDoc.department,
    priority: priority || "Medium",
    attachments,
    raisedBy: req.user._id,
    timeline: [{ status: "Pending", note: "Complaint submitted.", changedBy: req.user._id }],
  });

  res.status(201).json(new ApiResponse(201, { complaint }, "Complaint submitted successfully."));
});

// @route GET /api/complaints  (role-aware list with filters + pagination)
export const listComplaints = asyncHandler(async (req, res) => {
  const {
    status,
    category,
    department,
    priority,
    assignedTo,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { isDeleted: false };

  if (req.user.role === "student") query.raisedBy = req.user._id;
  if (req.user.role === "staff") query.assignedTo = req.user._id;

  if (status) query.status = status;
  if (category) query.category = category;
  if (department) query.department = department;
  if (priority) query.priority = priority;
  if (assignedTo && req.user.role === "admin") query.assignedTo = assignedTo;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate("category", "name")
      .populate("department", "name")
      .populate("raisedBy", "name email")
      .populate("assignedTo", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  res.json(
    new ApiResponse(200, {
      complaints,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  );
});

const assertComplaintAccess = (complaint, user) => {
  if (user.role === "admin") return;
  if (user.role === "staff" && String(complaint.assignedTo) === String(user._id)) return;
  if (user.role === "student" && String(complaint.raisedBy) === String(user._id)) return;
  throw new ApiError(403, "You do not have access to this complaint.");
};

// @route GET /api/complaints/:id
export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false })
    .populate("category", "name")
    .populate("department", "name")
    .populate("raisedBy", "name email")
    .populate("assignedTo", "name email")
    .populate("timeline.changedBy", "name role");

  if (!complaint) throw new ApiError(404, "Complaint not found.");
  assertComplaintAccess(complaint, req.user);

  const isStudent = req.user.role === "student";
  const comments = await Comment.find({
    complaint: complaint._id,
    ...(isStudent ? { isInternal: false } : {}),
  })
    .populate("author", "name role")
    .sort("createdAt");

  res.json(new ApiResponse(200, { complaint, comments }));
});

// @route PATCH /api/complaints/:id/status  (staff/admin)
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) throw new ApiError(404, "Complaint not found.");
  assertComplaintAccess(complaint, req.user);

  complaint.pushTimeline(status, note || "", req.user._id);
  await complaint.save();

  emitToUser(req, complaint.raisedBy, "complaint:updated", {
    complaintId: complaint._id,
    status,
  });

  res.json(new ApiResponse(200, { complaint }, "Status updated."));
});

// @route PATCH /api/complaints/:id/assign  (admin)
export const assignComplaint = asyncHandler(async (req, res) => {
  const { staffId } = req.body;
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) throw new ApiError(404, "Complaint not found.");

  complaint.assignedTo = staffId;
  complaint.pushTimeline("Assigned", "Complaint assigned to staff.", req.user._id);
  await complaint.save();

  emitToUser(req, staffId, "complaint:assigned", { complaintId: complaint._id });
  emitToUser(req, complaint.raisedBy, "complaint:updated", {
    complaintId: complaint._id,
    status: "Assigned",
  });

  res.json(new ApiResponse(200, { complaint }, "Complaint assigned."));
});

// @route POST /api/complaints/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) throw new ApiError(404, "Complaint not found.");
  assertComplaintAccess(complaint, req.user);

  const internalNote = req.user.role !== "student" && isInternal === true;

  const comment = await Comment.create({
    complaint: complaint._id,
    author: req.user._id,
    message,
    isInternal: internalNote,
  });

  if (!internalNote) {
    const notifyId =
      req.user.role === "student" ? complaint.assignedTo : complaint.raisedBy;
    if (notifyId) emitToUser(req, notifyId, "complaint:comment", { complaintId: complaint._id });
  }

  res.status(201).json(new ApiResponse(201, { comment }, "Comment added."));
});

// @route POST /api/complaints/:id/feedback  (student, after resolution)
export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
  if (!complaint) throw new ApiError(404, "Complaint not found.");
  if (String(complaint.raisedBy) !== String(req.user._id)) {
    throw new ApiError(403, "Only the complainant can submit feedback.");
  }
  if (!["Resolved", "Closed"].includes(complaint.status)) {
    throw new ApiError(400, "Feedback can only be submitted once the complaint is resolved.");
  }

  complaint.feedback = { rating, comment, submittedAt: new Date() };
  await complaint.save();

  res.json(new ApiResponse(200, { complaint }, "Thank you for your feedback."));
});

// @route DELETE /api/complaints/:id  (admin - soft delete)
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!complaint) throw new ApiError(404, "Complaint not found.");
  res.json(new ApiResponse(200, null, "Complaint removed."));
});

// @route GET /api/complaints/analytics/summary  (staff/admin dashboard cards)
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const scope = req.user.role === "staff" ? { assignedTo: req.user._id } : {};
  const base = { isDeleted: false, ...scope };

  const [statusCounts, priorityCounts, total, resolved] = await Promise.all([
    Complaint.aggregate([{ $match: base }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: base }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
    Complaint.countDocuments(base),
    Complaint.countDocuments({ ...base, status: { $in: ["Resolved", "Closed"] } }),
  ]);

  res.json(
    new ApiResponse(200, {
      total,
      resolved,
      pending: total - resolved,
      byStatus: statusCounts,
      byPriority: priorityCounts,
    })
  );
});
