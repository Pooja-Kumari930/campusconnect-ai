import mongoose from "mongoose";

const STATUSES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Waiting for User",
  "Resolved",
  "Closed",
  "Rejected",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, trim: true, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintCode: { type: String, required: true, unique: true }, // human-readable ID e.g. CC-2026-00042
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    status: { type: String, enum: STATUSES, default: "Pending" },
    attachments: [{ url: String, fileName: String, fileType: String }],
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    timeline: [timelineEntrySchema],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 1000 },
      submittedAt: Date,
    },
    aiMeta: {
      suggestedCategory: String,
      suggestedPriority: String,
      summary: String,
      duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

complaintSchema.index({ title: "text", description: "text" });
complaintSchema.index({ raisedBy: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });

complaintSchema.methods.pushTimeline = function (status, note, changedBy) {
  this.timeline.push({ status, note, changedBy, changedAt: new Date() });
  this.status = status;
};

export const COMPLAINT_STATUSES = STATUSES;
export const COMPLAINT_PRIORITIES = PRIORITIES;
export default mongoose.model("Complaint", complaintSchema);
