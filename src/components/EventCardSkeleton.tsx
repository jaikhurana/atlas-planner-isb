export default function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse-soft rounded-full bg-secondary" />
            <div className="h-5 w-14 animate-pulse-soft rounded-full bg-secondary" />
          </div>
          <div className="h-5 w-3/4 animate-pulse-soft rounded-md bg-secondary" />
          <div className="h-4 w-full animate-pulse-soft rounded-md bg-secondary" />
          <div className="flex gap-3 pt-1">
            <div className="h-4 w-28 animate-pulse-soft rounded-md bg-secondary" />
            <div className="h-4 w-20 animate-pulse-soft rounded-md bg-secondary" />
          </div>
        </div>
        <div className="h-8 w-8 animate-pulse-soft rounded-full bg-secondary" />
      </div>
    </div>
  );
}
