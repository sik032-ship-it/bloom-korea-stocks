import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Leaf, LockKeyhole, Play, RotateCcw, Sparkles, Star, TreePine, Trophy } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import acornImg from "@/assets/acorn.png";

interface TodayQuestPathProps {
  completed: number;
  total: number;
  done: boolean;
  userLevel: number;
  onStart: (stage: number, mode: "challenge" | "review" | "free") => void;
}

const questNames = [
  "좋은 기업 찾기",
  "고객과 해자 보기",
  "현금의 힘 알기",
  "흔들림 이겨내기",
  "오래 머무르기",
  "유혹 지나치기",
  "거장처럼 판단하기",
];

const encouragements = ["여기서 기다렸어요!", "한 문제면 더 단단해져요!", "같이 천천히 가요!", "오늘도 좋은 기업처럼 꾸준히!"];

export function TodayQuestPath({ completed, total, done, userLevel, onStart }: TodayQuestPathProps) {
  const safeTotal = Math.max(1, total);
  const solved = done ? safeTotal : Math.min(completed, safeTotal);
  const activeIndex = done ? safeTotal - 1 : Math.min(solved, safeTotal - 1);
  const progress = Math.round((solved / safeTotal) * 100);
  const mapRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointerId: number; y: number; scrollTop: number; moved: boolean } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [particleIndex, setParticleIndex] = useState<number | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    const node = activeRef.current;
    if (!map || !node) return;
    const target = node.offsetTop - map.clientHeight / 2 + node.clientHeight / 2;
    map.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [activeIndex]);

  const moveMap = (direction: -1 | 1) => {
    mapRef.current?.scrollBy({ top: direction * 260, behavior: "smooth" });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const map = mapRef.current;
    if (!map) return;
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { pointerId: event.pointerId, y: event.clientY, scrollTop: map.scrollTop, moved: false };
    map.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const map = mapRef.current;
    const drag = dragRef.current;
    if (!map || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientY - drag.y;
    if (Math.abs(delta) > 5) drag.moved = true;
    map.scrollTop = drag.scrollTop - delta;
  };

  const releasePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mapRef.current?.hasPointerCapture(event.pointerId)) mapRef.current.releasePointerCapture(event.pointerId);
    window.setTimeout(() => { dragRef.current = null; }, 0);
  };

  const selectStage = (index: number) => {
    if (dragRef.current?.moved) return;
    setSelectedIndex(index);
    setParticleIndex(index);
    window.setTimeout(() => setParticleIndex((current) => current === index ? null : current), 700);
  };

  const selectedComplete = selectedIndex !== null && selectedIndex < solved;
  const selectedActive = selectedIndex === activeIndex && !done;
  const selectedLocked = selectedIndex !== null && !selectedComplete && !selectedActive;
  const selectedMode = selectedComplete || done ? "review" : selectedActive ? "challenge" : "free";
  const selectedTitle = selectedIndex === null ? "" : questNames[selectedIndex] ?? "투자 원칙";

  return (
    <section id="today-cta" aria-labelledby="quest-title" className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card">
      <div className="bg-primary px-5 py-4 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-extrabold opacity-90">오늘의 숲길 · {solved}/{safeTotal}</p>
            <h2 id="quest-title" className="mt-1 text-[22px] font-extrabold leading-tight">좋은 기업과 오래 동행하기</h2>
          </div>
          <div className="shrink-0 rounded-xl bg-primary-foreground/15 px-3 py-2 text-center">
            <p className="text-[18px] font-extrabold tabular-nums leading-none">{progress}%</p>
            <p className="mt-1 text-[10px] font-bold opacity-90">오늘 훈련</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/25">
          <div className="h-full rounded-full bg-primary-foreground transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="relative border-b border-border bg-accent/30 px-4 py-2">
        <p className="text-center text-[11px] font-bold text-accent-foreground">길을 위아래로 밀어 탐험하고, 원하는 퀘스트를 눌러보세요</p>
        <Button type="button" variant="ghost" size="icon" onClick={() => moveMap(-1)} className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2" aria-label="위쪽 퀘스트 보기">
          <ChevronUp />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => moveMap(1)} className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2" aria-label="아래쪽 퀘스트 보기">
          <ChevronDown />
        </Button>
      </div>

      <div
        ref={mapRef}
        className="quest-map quest-map-scroll relative h-[34rem] cursor-grab select-none overflow-y-auto overscroll-contain active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
      >
        <div className="relative min-h-[52rem] px-6 pb-16 pt-16">
          <TreePine className="absolute left-5 top-20 h-9 w-9 text-primary/20" aria-hidden />
          <Leaf className="absolute right-7 top-52 h-7 w-7 rotate-12 text-primary/25" aria-hidden />
          <TreePine className="absolute bottom-40 right-4 h-11 w-11 text-primary/20" aria-hidden />
          <Sparkles className="absolute bottom-72 left-7 h-6 w-6 text-ppuri-amber/60 animate-twinkle" aria-hidden />

          <svg className="pointer-events-none absolute inset-x-0 top-10 h-[calc(100%-6rem)] w-full" viewBox="0 0 320 650" preserveAspectRatio="none" aria-hidden>
            <path className="quest-path-shadow" d="M160 25 C255 80 245 145 160 195 C65 250 75 320 160 370 C250 425 245 505 160 555 C95 592 105 620 160 638" />
            <path className="quest-path-dots" d="M160 25 C255 80 245 145 160 195 C65 250 75 320 160 370 C250 425 245 505 160 555 C95 592 105 620 160 638" />
          </svg>

          <div className="relative z-[1] flex flex-col gap-11">
            {Array.from({ length: safeTotal }, (_, index) => {
              const isComplete = index < solved;
              const isActive = index === activeIndex && !done;
              const isLocked = !isComplete && !isActive;
              const side = index % 4 === 1 ? "translate-x-12" : index % 4 === 3 ? "-translate-x-12" : "";
              return (
                <div key={index} className={`relative flex min-h-20 justify-center ${side}`}>
                  {isActive && (
                    <div className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-border bg-card px-3 py-1 text-xs font-extrabold text-primary shadow-card">
                      {solved === 0 ? "여기서 시작!" : "다음 모험!"}
                      <span className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-card" />
                    </div>
                  )}

                  <Button
                    ref={isActive || (done && index === activeIndex) ? activeRef : undefined}
                    type="button"
                    variant="ghost"
                    onClick={() => selectStage(index)}
                    aria-label={`${index + 1}단계 ${questNames[index] ?? "투자 원칙"}${isLocked ? " 잠김, 자유 도전 가능" : isComplete ? " 완료, 복습 가능" : " 도전 가능"}`}
                    aria-haspopup="dialog"
                    className={`quest-node relative h-16 w-16 rounded-full border-4 p-0 transition-transform focus-visible:ring-offset-4 ${
                      isActive
                        ? "quest-node-active border-primary/20 bg-primary text-primary-foreground hover:bg-primary hover:scale-105"
                        : isComplete
                          ? "quest-node-complete border-primary/15 bg-accent text-primary hover:bg-accent hover:scale-105"
                          : "border-muted bg-muted text-muted-foreground hover:bg-muted hover:scale-105"
                    }`}
                  >
                    {isComplete ? <Check className="h-7 w-7" strokeWidth={3} /> : isActive ? <Star className="h-8 w-8 fill-current" /> : <LockKeyhole className="h-6 w-6" />}
                    {particleIndex === index && (
                      <span className="quest-particles" aria-hidden>
                        <Star /><Sparkles /><img src={acornImg} alt="" />
                      </span>
                    )}
                  </Button>

                  <div className={`pointer-events-none absolute top-4 w-28 ${index % 2 === 0 ? "left-[calc(50%+46px)] text-left" : "right-[calc(50%+46px)] text-right"}`}>
                    <p className={`text-xs font-extrabold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>퀘스트 {index + 1}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{questNames[index] ?? "투자 원칙"}</p>
                  </div>

                  {isActive && (
                    <div className={`absolute top-[4.5rem] flex items-center ${index % 2 === 0 ? "right-0 flex-row" : "left-0 flex-row-reverse"}`} aria-hidden>
                      <Mascot level={userLevel} size="sm" className="animate-mascot-hop" />
                      <span className="max-w-24 rounded-xl border border-border bg-card px-2 py-1 text-center text-[10px] font-bold leading-tight text-foreground shadow-card">
                        {encouragements[index % encouragements.length]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="relative mt-2 flex min-h-24 justify-center">
              <button type="button" onClick={() => setSelectedIndex(safeTotal - 1)} className={`quest-chest press-effect flex h-20 w-24 items-center justify-center rounded-xl border-4 ${done ? "border-ppuri-amber/30 bg-tone-caution-bg" : "border-muted bg-muted"}`} aria-label={done ? "도토리 보상 획득 완료" : "도토리 보상 안내"}>
                {done ? <img src={acornImg} alt="오늘의 도토리 보상" className="h-12 w-12 object-contain animate-scale-pop" /> : <Trophy className="h-9 w-9 text-muted-foreground" />}
              </button>
              <div className="pointer-events-none absolute left-[calc(50%+62px)] top-4 w-28 text-left">
                <p className={`text-xs font-extrabold ${done ? "text-tone-caution-fg" : "text-muted-foreground"}`}>{done ? "보상 획득!" : "도토리 상자"}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">모든 퀘스트를 마치면 열려요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={selectedIndex !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl border-primary/20 px-5 pb-7 pt-6">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
          <SheetHeader className="text-left">
            <div className="flex items-start gap-3 pr-8">
              <Mascot mood={selectedComplete || done ? "celebrate" : selectedLocked ? "thinking" : "wave"} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-primary">퀘스트 {(selectedIndex ?? 0) + 1} · 도토리 1개</p>
                <SheetTitle className="mt-1 text-[22px] font-extrabold">{selectedTitle}</SheetTitle>
                <SheetDescription className="mt-1 leading-relaxed">
                  {selectedComplete || done
                    ? "이미 해낸 길이에요. 다시 풀면 판단의 뿌리가 더 단단해져요."
                    : selectedLocked
                      ? "이전 단계를 완료하면 열려요! 기다리기 어렵다면 자유 도전도 가능해요."
                      : "지금 다람쥐가 기다리고 있어요. 오늘의 판단 미션을 시작해볼까요?"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {(selectedComplete || done) && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-tone-caution-bg px-4 py-3 text-tone-caution-fg">
              <span className="text-sm font-extrabold">완료 별점</span>
              <span className="flex gap-1" aria-label="별점 3점"><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /></span>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            onClick={() => selectedIndex !== null && onStart(selectedIndex + 1, selectedMode)}
            className="press-effect mt-5 h-14 w-full rounded-xl text-base font-extrabold shadow-button"
          >
            {selectedMode === "review" ? <RotateCcw /> : <Play className="fill-current" />}
            {selectedMode === "review" ? "복습 문제 다시 풀기" : selectedMode === "free" ? "자유 도전하기" : "오늘의 미션 도전하기"}
          </Button>
        </SheetContent>
      </Sheet>
    </section>
  );
}