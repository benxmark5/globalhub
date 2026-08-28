export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-700/40" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-40 animate-pulse rounded-2xl bg-slate-700/40" />;
}
