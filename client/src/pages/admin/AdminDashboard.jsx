import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ListChecks, Clock, CheckCircle2, Users } from "lucide-react";
import { complaintService, userService } from "../../services/complaintService.js";
import { CardSkeleton } from "../../components/ui/Skeleton.jsx";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";

const AdminDashboard = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["analytics-summary", "admin"],
    queryFn: complaintService.analyticsSummary,
  });
  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ["complaints", "admin-recent"],
    queryFn: () => complaintService.list({ limit: 6 }),
  });
  const { data: usersData } = useQuery({
    queryKey: ["users", "count"],
    queryFn: () => userService.listUsers({ limit: 1 }),
  });

  const s = summary?.data;
  const priorityData = s?.byPriority?.map((d) => ({ name: d._id, count: d.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">System overview</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Portal-wide complaint activity and workload.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center"><ListChecks size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.total ?? 0}</p>
            <p className="text-sm text-neutral-500">Total Complaints</p>
          </div>
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-warning-100 text-warning flex items-center justify-center"><Clock size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.pending ?? 0}</p>
            <p className="text-sm text-neutral-500">Pending</p>
          </div>
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-success-100 text-success flex items-center justify-center"><CheckCircle2 size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.resolved ?? 0}</p>
            <p className="text-sm text-neutral-500">Resolved</p>
          </div>
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent-600 flex items-center justify-center"><Users size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{usersData?.data?.pagination?.total ?? "—"}</p>
            <p className="text-sm text-neutral-500">Registered Users</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-display font-semibold mb-3">By priority</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Recent complaints</h3>
          <ComplaintTable complaints={complaintsData?.data?.complaints} isLoading={isLoading} basePath="/admin/complaints" showRaisedBy />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
