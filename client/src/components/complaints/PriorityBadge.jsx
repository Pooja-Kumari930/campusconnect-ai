const STYLES = {
  Low: "bg-neutral-200 text-neutral-700",
  Medium: "bg-primary-100 text-primary-600",
  High: "bg-warning-100 text-warning",
  Urgent: "bg-danger-100 text-danger",
};

const PriorityBadge = ({ priority }) => (
  <span className={`badge ${STYLES[priority] || "bg-neutral-200 text-neutral-700"}`}>{priority}</span>
);

export default PriorityBadge;
