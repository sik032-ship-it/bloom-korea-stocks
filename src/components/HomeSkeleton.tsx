export function HomeSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Mascot greeting skeleton */}
      <div className="flex items-start gap-3 pt-2">
        <div className="w-28 h-28 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse mt-2" />
        </div>
      </div>

      {/* CTA skeleton */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card">
        <div className="text-center py-3 space-y-3">
          <div className="h-4 w-40 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-3 shadow-card">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="h-5 w-8 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* XP progress skeleton */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-full bg-muted rounded-full animate-pulse" />
      </div>

      {/* Calendar skeleton */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
