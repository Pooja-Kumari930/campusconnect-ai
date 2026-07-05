const STYLES = {
  Pending: "bg-warning-100 text-warning",
  Assigned: "bg-primary-100 text-primary-600",
  "In Progress": "bg-accent/10 text-accent-600",
  "Waiting for User": "bg-warning-100 text-warning",
  Resolved: "bg-success-100 text-success",
  Closed: "bg-neutral-200 text-neutral-700",
  Rejected: "bg-danger-100 text-danger",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STYLES[status] || "bg-neutral-200 text-neutral-700"}`}>{status}</span>
);

export default StatusBadge;
