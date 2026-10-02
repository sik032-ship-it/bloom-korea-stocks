import { describe, expect, it } from "vitest";
import { didTreeGrow, getTreeProgress, getTreeStage } from "@/utils/treeGrowth";

describe("tree growth milestones", () => {
  it.each([
    [0, 0, "작은 새싹"],
    [4, 0, "작은 새싹"],
    [5, 1, "어린 나무"],
    [19, 1, "어린 나무"],
    [20, 2, "도토리 나무"],
    [49, 2, "도토리 나무"],
    [50, 3, "다람쥐 숲"],
  ])("maps %i sentences to stage %i", (sentences, index, name) => {
    expect(getTreeStage(sentences)).toMatchObject({ index, name });
  });

  it.each([[4, 5], [19, 20], [49, 50]])("detects growth from %i to %i", (before, after) => {
    expect(didTreeGrow(before, after)).toBe(true);
  });

  it("does not announce ordinary progress", () => {
    expect(didTreeGrow(5, 6)).toBe(false);
    expect(getTreeProgress(5)).toBe(0);
    expect(getTreeProgress(50)).toBe(100);
  });
});