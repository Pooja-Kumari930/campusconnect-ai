import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ListChecks, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { complaintService } from "../../services/complaintService.js";
import { CardSkeleton } from "../../components/ui/Skeleton.jsx";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone}`}>
      <Icon size={18} />
    </div>
    <p className="text-2xl font-display font-bold text-neutral-900 dark:text-white mt-3">{value}</p>
    <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
  </motion.div>
);

const StudentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "student-recent"],
    queryFn: () => complaintService.list({ limit: 5 }),
  });

  const complaints = data?.data?.complaints || [];
  const pending = complaints.filter((c) => !["Resolved", "Closed"].includes(c.status)).length;
  const resolved = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;
  const urgent = complaints.filter((c) => c.priority === "Urgent").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Your complaints at a glance</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track status, chat with staff, and get resolutions faster.</p>
        </div>
        <Link to="/student/raise" className="btn-primary">Raise Complaint</Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ListChecks} label="Total Complaints" value={data?.data?.pagination?.total ?? 0} tone="bg-primary-100 text-primary-600" />
          <StatCard icon={Clock} label="Open" value={pending} tone="bg-warning-100 text-warning" />
          <StatCard icon={CheckCircle2} label="Resolved" value={resolved} tone="bg-success-100 text-success" />
        </div>
      )}

      <div>
        <h3 className="font-display font-semibold text-neutral-900 dark:text-white mb-3">Recent complaints</h3>
        <ComplaintTable complaints={complaints} isLoading={isLoading} basePath="/student/complaints" />
      </div>
    </div>
  );
};

export default StudentDashboard;
