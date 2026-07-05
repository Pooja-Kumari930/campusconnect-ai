import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { complaintService } from "../../services/complaintService.js";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";
import { COMPLAINT_STATUSES } from "../../utils/constants.js";

const MyComplaints = () => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "mine", { status, search, page }],
    queryFn: () => complaintService.list({ status: status || undefined, search: search || undefined, page }),
  });

  const complaints = data?.data?.complaints || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">My Complaints</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              placeholder="Search complaints..."
              className="input-field pl-9 w-56"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input-field w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <ComplaintTable complaints={complaints} isLoading={isLoading} basePath="/student/complaints" />

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

export default MyComplaints;
