export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="size-7 animate-spin rounded-full border-2 border-[#1b3a3a] border-t-transparent" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="h-10 animate-pulse rounded-md bg-slate-100" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-md bg-slate-50"
        />
      ))}
    </div>
  );
}
