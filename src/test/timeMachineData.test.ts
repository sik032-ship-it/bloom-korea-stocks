import { describe, it, expect } from "vitest";
import { TIME_MACHINE, closeAt, milestoneAt } from "@/data/timeMachineHistory";

// 2006년 말 → 2016년 말 실제 분할조정 종가 배수 (원주가/분할계수로 독립 계산)
const RAW: Record<string, [number, number]> = {
  MSFT: [29.86, 62.14],
  GOOGL: [460.48 / 40, 792.45 / 20],
  AMZN: [39.46 / 20, 749.87 / 20],
  AAPL: [84.84 / 28, 115.82 / 4],
};

describe("타임머신 2006→2016 현실 일치", () => {
  for (const c of TIME_MACHINE) {
    it(`${c.ticker} 배수가 원주가 계산과 1% 이내`, () => {
      const app = closeAt(c, 2016) / closeAt(c, 2006);
      const [a, b] = RAW[c.ticker];
      expect(Math.abs(app / (b / a) - 1)).toBeLessThan(0.01);
    });
    it(`${c.ticker} 2006·2016 블럽이 해당 연도 기록`, () => {
      expect(milestoneAt(c, 2006).year).toBe(2006);
      expect(milestoneAt(c, 2016).year).toBe(2016);
      expect(milestoneAt(c, 2016).story).not.toMatch(/2006년엔/);
    });
  }
});
