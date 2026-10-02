import stage1 from "@/assets/tree-stage-1.png";
import stage2 from "@/assets/tree-stage-2.png";
import stage3 from "@/assets/tree-stage-3.png";
import stage4 from "@/assets/tree-stage-4.png";

export type TreeStage = {
  min: number;
  img: string;
  name: string;
  next: number | null;
};

export const TREE_STAGES: TreeStage[] = [
  { min: 0, img: stage1, name: "작은 새싹", next: 5 },
  { min: 5, img: stage2, name: "어린 나무", next: 20 },
  { min: 20, img: stage3, name: "도토리 나무", next: 50 },
  { min: 50, img: stage4, name: "다람쥐 숲", next: null },
];

export function getTreeStage(sentences: number): TreeStage & { index: number } {
  const safeCount = Math.max(0, sentences);
  const index = TREE_STAGES.reduce((current, stage, stageIndex) => (
    safeCount >= stage.min ? stageIndex : current
  ), 0);
  return { ...TREE_STAGES[index], index };
}

export function getTreeProgress(sentences: number): number {
  const stage = getTreeStage(sentences);
  if (stage.next === null) return 100;
  return Math.min(100, Math.max(0, ((sentences - stage.min) / (stage.next - stage.min)) * 100));
}

export function didTreeGrow(oldCount: number, newCount: number): boolean {
  return getTreeStage(oldCount).index < getTreeStage(newCount).index;
}