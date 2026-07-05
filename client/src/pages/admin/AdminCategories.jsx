import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import { categoryService, departmentService } from "../../services/complaintService.js";
import { api } from "../../services/api.js";

const AdminCategories = () => {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: categoryService.list });
  const { data: deptData } = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/categories", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Category created.");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create category."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Category removed.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Categories</h2>

      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) createMutation.mutate({ name, department: department || undefined }); }}
        className="flex gap-2"
      >
        <input className="input-field" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input-field w-48" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">No department</option>
          {deptData?.data?.departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <button type="submit" className="btn-primary shrink-0"><Plus size={16} /> Add</button>
      </form>

      <div className="glass-card divide-y divide-neutral-200 dark:divide-neutral-800">
        {isLoading && <p className="p-5 text-sm text-neutral-500">Loading...</p>}
        {data?.data?.categories?.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{c.name}</span>
              {c.department?.name && <span className="text-xs text-neutral-400 ml-2">({c.department.name})</span>}
            </div>
            <button onClick={() => deleteMutation.mutate(c._id)} className="text-xs text-danger hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
