import stage1 from "@/assets/tree-stage-1.png";
import stage2 from "@/assets/tree-stage-2.png";
import stage3 from "@/assets/tree-stage-3.png";
import stage4 from "@/assets/tree-stage-4.png";

const STAGES = [
  { min: 0, img: stage1, name: "작은 새싹", next: 5 },
  { min: 5, img: stage2, name: "어린 나무", next: 20 },
  { min: 20, img: stage3, name: "도토리 나무", next: 50 },
  { min: 50, img: stage4, name: "다람쥐 숲", next: null as number | null },
];

export default function GrowingTree({ sentences }: { sentences: number }) {
  const idx = STAGES.reduce((acc, s, i) => (sentences >= s.min ? i : acc), 0);
  const stage = STAGES[idx];
  const left = stage.next ? stage.next - sentences : 0;
  const pct = stage.next ? ((sentences - stage.min) / (stage.next - stage.min)) * 100 : 100;

  return (
    <section aria-label="나의 나무" className="relative overflow-hidden rounded-3xl bg-gradient-done border border-primary/20 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-wider">MY TREE · {idx + 1}단계</p>
          <p className="text-[22px] font-extrabold text-foreground leading-tight mt-1">{stage.name}</p>
        </div>
        <div className="flex gap-1" aria-hidden>
          {STAGES.map((_, i) => (
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
        className="mx-auto w-52 h-52 object-contain animate-pop-in origin-bottom"
      />
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full progress-shine transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-small text-muted-foreground mt-2 text-center">
        {stage.next ? <>문장 <b className="text-foreground">{left}개</b> 더 심으면 나무가 자라요</> : "울창한 숲을 이뤘어요. 오래 머무른 덕분이에요"}
      </p>
    </section>
  );
}
