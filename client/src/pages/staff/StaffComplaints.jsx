import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "../../services/complaintService.js";
import ComplaintTable from "../../components/complaints/ComplaintTable.jsx";
import { COMPLAINT_STATUSES } from "../../utils/constants.js";

const StaffComplaints = () => {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "staff-all", { status }],
    queryFn: () => complaintService.list({ status: status || undefined, limit: 20 }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900 dark:text-white">Assigned Complaints</h2>
        <select className="input-field w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {COMPLAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <ComplaintTable complaints={data?.data?.complaints} isLoading={isLoading} basePath="/staff/complaints" showRaisedBy />
    </div>
  );
};

export default StaffComplaints;
