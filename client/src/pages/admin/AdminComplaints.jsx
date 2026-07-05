import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "../../services/complaintService.js";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";
import { COMPLAINT_STATUSES } from "../../utils/constants.js";

const AdminComplaints = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "admin-all", { status, page }],
    queryFn: () => complaintService.list({ status: status || undefined, page, limit: 15 }),
  });

  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">All Complaints</h2>
        <select className="input-field w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <ComplaintTable complaints={data?.data?.complaints} isLoading={isLoading} basePath="/admin/complaints" showRaisedBy />
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${page === i + 1 ? "bg-brand-gradient text-white" : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
