import { TREE_STAGES, getTreeProgress, getTreeStage } from "@/utils/treeGrowth";

export default function GrowingTree({ sentences }: { sentences: number }) {
  const stage = getTreeStage(sentences);
  const idx = stage.index;
  const left = stage.next ? stage.next - sentences : 0;
  const pct = getTreeProgress(sentences);

  return (
    <section aria-label="나의 나무" className="relative overflow-hidden rounded-3xl bg-gradient-done border border-primary/20 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-wider">MY TREE · {idx + 1}단계</p>
          <p className="text-[22px] font-extrabold text-foreground leading-tight mt-1">{stage.name}</p>
        </div>
        <div className="flex gap-1" aria-hidden>
          {TREE_STAGES.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      <img
        key={idx}
        src={stage.img}
        alt={`${stage.name} 일러스트`}
        width={816}
        height={816}
        loading="lazy"
        className="mx-auto w-52 h-52 object-contain animate-tree-breathe origin-bottom"
      />
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full progress-shine transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-small text-muted-foreground mt-2 text-center">
        {stage.next ? <>퀘스트 완주 <b className="text-foreground">{left}번</b> 더 하면 나무가 자라요</> : "울창한 숲을 이뤘어요. 오래 머무른 덕분이에요"}
      </p>
    </section>
  );
}
