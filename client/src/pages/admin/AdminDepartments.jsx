import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import { departmentService } from "../../services/complaintService.js";
import { api } from "../../services/api.js";

const AdminDepartments = () => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["departments"], queryFn: departmentService.list });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post("/departments", payload).then((r) => r.data),
    onSuccess: () => {
      toast.success("Department created.");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create department."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/departments/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success("Department removed.");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Departments</h2>

      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) createMutation.mutate({ name }); }}
        className="flex gap-2"
      >
        <input className="input-field" placeholder="New department name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn-primary shrink-0"><Plus size={16} /> Add</button>
      </form>

      <div className="glass-card divide-y divide-neutral-200 dark:divide-neutral-800">
        {isLoading && <p className="p-5 text-sm text-neutral-500">Loading...</p>}
        {data?.data?.departments?.map((d) => (
          <div key={d._id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{d.name}</span>
            <button onClick={() => deleteMutation.mutate(d._id)} className="text-xs text-danger hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDepartments;
