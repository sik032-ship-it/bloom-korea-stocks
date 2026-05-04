// 시뮬레이션 가격 — 실제 API 없이 위기 트리거를 검증
// 결정론적: 같은 ticker + 같은 날짜 → 같은 가격
// 가끔 -10% ~ -25% 위기 이벤트가 발동되도록 설계 (행동 코칭 검증용)

const BASE_PRICE: Record<string, number> = {
  AAPL: 230,
  MSFT: 420,
  GOOGL: 180,
  AMZN: 200,
  TSLA: 250,
  NVDA: 140,
  META: 580,
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function dailyNoise(ticker: string, dayKey: string): number {
  // ±3% 일상 변동
  const n = hash(`${ticker}:${dayKey}`) % 1000;
  return (n / 1000 - 0.5) * 0.06; // -3% ~ +3%
}

function crisisShock(ticker: string, dayKey: string): number {
  // 약 8% 확률로 -10~-25% 위기 발동 (검증을 위해 의도적으로 자주)
  const n = hash(`crisis:${ticker}:${dayKey}`) % 100;
  if (n < 8) {
    const depth = (hash(`depth:${ticker}:${dayKey}`) % 16) + 10; // 10~25%
    return -depth / 100;
  }
  return 0;
}

export interface PriceSnapshot {
  ticker: string;
  price: number;
  changePct: number; // 전일 대비 % (예: -0.12 = -12%)
}

export function getSimulatedPrice(ticker: string, date = new Date()): PriceSnapshot {
  const dayKey = date.toISOString().slice(0, 10);
  const base = BASE_PRICE[ticker] ?? 100;
  const noise = dailyNoise(ticker, dayKey);
  const shock = crisisShock(ticker, dayKey);
  const changePct = noise + shock;
  const price = base * (1 + changePct);
  return { ticker, price: Math.round(price * 100) / 100, changePct };
}

/** 보유 종목 중 가장 큰 하락(% 기준)을 보인 종목을 반환. 임계값 이하면 null. */
export function detectCrisisTrigger(
  tickers: string[],
  thresholdPct: number = -0.10,
): PriceSnapshot | null {
  if (tickers.length === 0) return null;
  let worst: PriceSnapshot | null = null;
  for (const t of tickers) {
    const snap = getSimulatedPrice(t);
    if (snap.changePct <= thresholdPct) {
      if (!worst || snap.changePct < worst.changePct) worst = snap;
    }
  }
  return worst;
}
