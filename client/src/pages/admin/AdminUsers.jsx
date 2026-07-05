import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { userService } from "../../services/complaintService.js";
import { api } from "../../services/api.js";
import { RowSkeleton } from "../../components/ui/Skeleton.jsx";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", { search, role }],
    queryFn: () => userService.listUsers({ search: search || undefined, role: role || undefined, limit: 20 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => api.patch(`/users/${id}`, updates).then((r) => r.data),
    onSuccess: () => {
      toast.success("User updated.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Update failed."),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Manage Users</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input placeholder="Search name or email" className="input-field pl-9 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-40" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-5 divide-y divide-neutral-200 dark:divide-neutral-800">
            {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.users?.map((u) => (
                <tr key={u._id} className="border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900 dark:text-white">{u.name}</td>
                  <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      className="input-field py-1.5 text-xs w-28"
                      defaultValue={u.role}
                      onChange={(e) => updateMutation.mutate({ id: u._id, updates: { role: e.target.value } })}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => updateMutation.mutate({ id: u._id, updates: { isActive: !u.isActive } })}
                      className={`badge ${u.isActive ? "bg-success-100 text-success" : "bg-danger-100 text-danger"}`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
