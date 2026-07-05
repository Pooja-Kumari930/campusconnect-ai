import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isInternal: { type: Boolean, default: false }, // staff-only note, hidden from student
    attachments: [{ url: String, fileName: String, fileType: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
