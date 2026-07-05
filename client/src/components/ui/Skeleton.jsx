const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="glass-card p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-7 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const RowSkeleton = () => (
  <div className="flex items-center gap-4 py-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export default Skeleton;
