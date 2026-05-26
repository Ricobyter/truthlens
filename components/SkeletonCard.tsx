export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-4 overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
