import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import { RowSkeleton } from "../ui/Skeleton.jsx";

const ComplaintTable = ({ complaints, isLoading, basePath, showRaisedBy = false }) => {
  if (isLoading) {
    return (
      <div className="glass-card p-5 divide-y divide-neutral-200 dark:divide-neutral-800">
        {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    );
  }

  if (!complaints?.length) {
    return (
      <div className="glass-card p-12 flex flex-col items-center text-center">
        <Inbox size={36} className="text-neutral-300 mb-3" />
        <p className="font-semibold text-neutral-700 dark:text-neutral-200">No complaints found</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Try adjusting your filters, or check back later.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-5 py-3">ID</th>
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Category</th>
            {showRaisedBy && <th className="px-5 py-3">Raised By</th>}
            <th className="px-5 py-3">Priority</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id} className="border-b border-neutral-100 dark:border-neutral-800/60 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
              <td className="px-5 py-3 font-mono text-xs text-neutral-500">{c.complaintCode}</td>
              <td className="px-5 py-3">
                <Link to={`${basePath}/${c._id}`} className="font-medium text-neutral-900 dark:text-white hover:text-primary-600">
                  {c.title}
                </Link>
              </td>
              <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{c.category?.name}</td>
              {showRaisedBy && <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{c.raisedBy?.name}</td>}
              <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
              <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
              <td className="px-5 py-3 text-neutral-500 text-xs">{new Date(c.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable;
