import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { complaintService } from "../../services/complaintService.js";

const COLORS = ["#2563EB", "#06B6D4", "#F59E0B", "#16A34A", "#DC2626", "#64748B", "#94A3B8"];

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({ queryKey: ["analytics-summary", "full"], queryFn: complaintService.analyticsSummary });
  const s = data?.data;
  const statusData = s?.byStatus?.map((d) => ({ name: d._id, value: d.count })) || [];
  const priorityData = s?.byPriority?.map((d) => ({ name: d._id, count: d.count })) || [];

  if (isLoading) return <p className="text-sm text-neutral-500">Loading analytics...</p>;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-3">Pending vs Resolved</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-3">Complaints by priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-2xl font-display font-bold">{s?.total ?? 0}</p>
          <p className="text-sm text-neutral-500">Total complaints</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-display font-bold">{s?.resolved ?? 0}</p>
          <p className="text-sm text-neutral-500">Resolved</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-display font-bold">{s?.pending ?? 0}</p>
          <p className="text-sm text-neutral-500">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
