import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Paperclip, Send, Star, Clock, User as UserIcon, Lock } from "lucide-react";
import { complaintService, userService } from "../services/complaintService.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusBadge from "../components/complaints/StatusBadge.jsx";
import PriorityBadge from "../components/complaints/PriorityBadge.jsx";
import { COMPLAINT_STATUSES } from "../utils/constants.js";

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintService.get(id),
  });

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: userService.listStaff,
    enabled: user.role === "admin",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["complaint", id] });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }) => complaintService.updateStatus(id, status, note),
    onSuccess: () => { toast.success("Status updated."); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update status."),
  });

  const assignMutation = useMutation({
    mutationFn: (staffId) => complaintService.assign(id, staffId),
    onSuccess: () => { toast.success("Complaint assigned."); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to assign."),
  });

  const commentMutation = useMutation({
    mutationFn: () => complaintService.addComment(id, message, isInternal),
    onSuccess: () => { setMessage(""); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to add comment."),
  });

  const feedbackMutation = useMutation({
    mutationFn: () => complaintService.submitFeedback(id, rating, feedbackText),
    onSuccess: () => { toast.success("Thanks for your feedback!"); invalidate(); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to submit feedback."),
  });

  if (isLoading) return <Loader label="Loading complaint..." />;

  const complaint = data?.data?.complaint;
  const comments = data?.data?.comments || [];
  if (!complaint) return <p>Complaint not found.</p>;

  const canManage = user.role === "staff" || user.role === "admin";
  const canGiveFeedback =
    user.role === "student" && ["Resolved", "Closed"].includes(complaint.status) && !complaint.feedback?.submittedAt;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-neutral-500">{complaint.complaintCode}</p>
              <h2 className="font-display text-xl font-bold text-neutral-900 dark:text-white mt-1">{complaint.title}</h2>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-4 whitespace-pre-line">{complaint.description}</p>

          {complaint.attachments?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {complaint.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 text-neutral-600 dark:text-neutral-300 hover:text-primary-600"
                >
                  <Paperclip size={12} /> {a.fileName}
                </a>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <div><p className="font-semibold text-neutral-700 dark:text-neutral-200">Category</p>{complaint.category?.name}</div>
            <div><p className="font-semibold text-neutral-700 dark:text-neutral-200">Department</p>{complaint.department?.name || "—"}</div>
            <div><p className="font-semibold text-neutral-700 dark:text-neutral-200">Raised By</p>{complaint.raisedBy?.name}</div>
            <div><p className="font-semibold text-neutral-700 dark:text-neutral-200">Assigned To</p>{complaint.assignedTo?.name || "Unassigned"}</div>
          </div>
        </motion.div>

        {/* Comments / chat */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-neutral-900 dark:text-white mb-4">Discussion</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {comments.length === 0 && <p className="text-sm text-neutral-500">No messages yet.</p>}
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {c.author?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{c.author?.name}</p>
                    {c.isInternal && (
                      <span className="badge bg-neutral-200 text-neutral-600 flex items-center gap-1"><Lock size={10} /> Internal</span>
                    )}
                    <p className="text-[11px] text-neutral-400">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <textarea
              rows={2}
              placeholder="Write a message..."
              className="input-field resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              {canManage && (
                <label className="flex items-center gap-2 text-xs text-neutral-500">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                  Internal note (hidden from student)
                </label>
              )}
              <button
                disabled={!message.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate()}
                className="btn-primary ml-auto"
              >
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Timeline */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-neutral-900 dark:text-white mb-4">Timeline</h3>
          <ol className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 space-y-4">
            {complaint.timeline.slice().reverse().map((t, i) => (
              <li key={i}>
                <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-primary-500" />
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t.status}</p>
                {t.note && <p className="text-xs text-neutral-500">{t.note}</p>}
                <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {new Date(t.changedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {canManage && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-semibold text-neutral-900 dark:text-white">Manage</h3>

            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Update status</label>
              <select
                className="input-field"
                value={complaint.status}
                onChange={(e) => statusMutation.mutate({ status: e.target.value, note: "" })}
              >
                {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {user.role === "admin" && (
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1 block flex items-center gap-1">
                  <UserIcon size={12} /> Assign staff
                </label>
                <select
                  className="input-field"
                  defaultValue={complaint.assignedTo?._id || ""}
                  onChange={(e) => e.target.value && assignMutation.mutate(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {staffData?.data?.staff?.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {canGiveFeedback && (
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-display font-semibold text-neutral-900 dark:text-white">Leave feedback</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star size={20} className={n <= rating ? "fill-warning text-warning" : "text-neutral-300"} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="How was your experience?"
              className="input-field resize-none"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <button onClick={() => feedbackMutation.mutate()} className="btn-primary w-full">Submit Feedback</button>
          </div>
        )}

        {complaint.feedback?.submittedAt && (
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold text-neutral-900 dark:text-white mb-2">Feedback</h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={16} className={n <= complaint.feedback.rating ? "fill-warning text-warning" : "text-neutral-300"} />
              ))}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{complaint.feedback.comment}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;
