import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UploadCloud, X, FileText } from "lucide-react";
import { complaintService, categoryService } from "../../services/complaintService.js";

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.list,
  });
  const categories = categoryData?.data?.categories || [];

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("priority", values.priority);
      files.forEach((f) => formData.append("attachments", f));

      const res = await complaintService.create(formData);
      toast.success(`Complaint ${res.data.complaint.complaintCode} submitted successfully!`);
      navigate(`/student/complaints/${res.data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint.");
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white mb-1">Raise a complaint</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Give as much detail as possible so staff can resolve it quickly.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Title</label>
          <input placeholder="Brief summary of the issue" className="input-field" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Category</label>
            <select className="input-field" {...register("category", { required: "Category is required" })}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-danger mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Priority</label>
            <select className="input-field" defaultValue="Medium" {...register("priority")}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Description</label>
          <textarea
            rows={5}
            placeholder="Describe what happened, when, and where..."
            className="input-field resize-none"
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1 block">Attachments (images or PDF, up to 5)</label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl py-8 cursor-pointer hover:border-primary-400 transition">
            <UploadCloud size={22} className="text-neutral-400" />
            <span className="text-sm text-neutral-500">Click to upload or drag files here</span>
            <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleFiles} />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 truncate"><FileText size={14} /> {f.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="text-neutral-400 hover:text-danger">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
};

export default RaiseComplaint;
