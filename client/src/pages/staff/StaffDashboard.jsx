import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ListChecks, Clock, CheckCircle2 } from "lucide-react";
import { complaintService } from "../../services/complaintService.js";
import { CardSkeleton } from "../../components/ui/Skeleton.jsx";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";

const COLORS = ["#2563EB", "#06B6D4", "#F59E0B", "#16A34A", "#DC2626", "#64748B", "#94A3B8"];

const StaffDashboard = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["analytics-summary", "staff"],
    queryFn: complaintService.analyticsSummary,
  });
  const { data: complaintsData, isLoading } = useQuery({
    queryKey: ["complaints", "staff-recent"],
    queryFn: () => complaintService.list({ limit: 6 }),
  });

  const s = summary?.data;
  const pieData = s?.byStatus?.map((d) => ({ name: d._id, value: d.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Assigned to you</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Complaints routed to you for resolution.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center"><ListChecks size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.total ?? 0}</p>
            <p className="text-sm text-neutral-500">Total Assigned</p>
          </div>
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-warning-100 text-warning flex items-center justify-center"><Clock size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.pending ?? 0}</p>
            <p className="text-sm text-neutral-500">Open</p>
          </div>
          <div className="glass-card p-5">
            <div className="h-10 w-10 rounded-xl bg-success-100 text-success flex items-center justify-center"><CheckCircle2 size={18} /></div>
            <p className="text-2xl font-display font-bold mt-3">{s?.resolved ?? 0}</p>
            <p className="text-sm text-neutral-500">Resolved</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-display font-semibold mb-3">By status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-3">Recent complaints</h3>
          <ComplaintTable complaints={complaintsData?.data?.complaints} isLoading={isLoading} basePath="/staff/complaints" showRaisedBy />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
