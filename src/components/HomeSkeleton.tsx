export function HomeSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in" aria-busy="true" aria-label="홈을 불러오는 중">
      {/* Hero: Mascot + greeting bubble — matches HomePage 'today-cta' section */}
      <section className="pt-2">
        <div className="flex items-start gap-3 mb-5">
          {/* Mascot lg ~ 7rem */}
          <div className="w-28 h-28 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 pt-1">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            {/* Speech bubble placeholder */}
            <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
              <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Primary CTA — same height/shape as 오늘의 레슨 버튼 to prevent layout shift */}
        <div className="text-center">
          <div className="h-3 w-32 bg-muted rounded animate-pulse mx-auto mb-2" />
          <div className="h-[60px] w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse mx-auto mt-2" />
        </div>
      </section>

      {/* Progress card — LevelBadge + bar + 3 stat row */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-muted rounded-full animate-pulse mb-3" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* RichMindsetCard placeholder */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
      </div>

      {/* Big4Cards placeholder — 4 tiles */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>

      {/* StayDashboard placeholder */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-20 w-full bg-muted rounded-xl animate-pulse" />
      </div>

      {/* TimeMachinePreview placeholder */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-16 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
