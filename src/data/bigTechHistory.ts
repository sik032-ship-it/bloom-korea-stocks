// 빅테크 6종목 — 10년/20년 전 vs 오늘 (분할조정 종가, 보수적 추정치)
// 출처: StatMuse, Macrotrends, Yahoo Finance, NVIDIA IR, Chase IDC
// 마지막 업데이트: 2026-04 (분기마다 수동 재검증 필요)

export interface BigTechRecord {
  ticker: string;
  company: string;
  emoji: string;
  price20yAgo: number;   // 2006.4 종가 (분할조정 USD)
  price10yAgo: number;   // 2016.4 종가 (분할조정 USD)
  priceToday: number;    // 최근 종가 USD
  cagr20y: number;       // 연평균 복리 수익률 (참고용)
  cagr10y: number;
  story: string;         // 그때 사람들의 인식 한 줄
  source: string;
}

export const BIG_TECH: BigTechRecord[] = [
  {
    ticker: "NVDA",
    company: "엔비디아",
    emoji: "🎮",
    price20yAgo: 0.40,
    price10yAgo: 8.50,
    priceToday: 208,
    cagr20y: 0.355,
    cagr10y: 0.376,
    story: "2006년엔 그래픽카드 회사. 2016년엔 게이머용 칩. 오늘은 AI 시대의 심장.",
    source: "StatMuse, NVIDIA IR (분할조정)",
  },
  {
    ticker: "AAPL",
    company: "애플",
    emoji: "🍎",
    price20yAgo: 2.30,
    price10yAgo: 24.0,
    priceToday: 256,
    cagr20y: 0.265,
    cagr10y: 0.268,
    story: "2006년 아이폰은 아직 없었음. 2016년 버핏도 그제서야 매수. 오늘 시총 세계 1위급.",
    source: "Yahoo Finance (분할조정)",
  },
  {
    ticker: "AMZN",
    company: "아마존",
    emoji: "📦",
    price20yAgo: 1.78,
    price10yAgo: 33.0,
    priceToday: 210,
    cagr20y: 0.270,
    cagr10y: 0.205,
    story: "2006년엔 '책 파는 적자 회사'. 2016년 AWS 본격화. 오늘 클라우드+커머스 양대 제국.",
    source: "Macrotrends (분할조정)",
  },
  {
    ticker: "MSFT",
    company: "마이크로소프트",
    emoji: "💻",
    price20yAgo: 24.0,
    price10yAgo: 50.0,
    priceToday: 405,
    cagr20y: 0.150,
    cagr10y: 0.232,
    story: "2006년 '한물간 회사' 평가. 2016년 사티야 나델라의 클라우드 전환. 오늘 AI 동맹군.",
    source: "Chase IDC, Macrotrends",
  },
  {
    ticker: "GOOGL",
    company: "알파벳(구글)",
    emoji: "🔍",
    price20yAgo: 20.0,
    price10yAgo: 38.0,
    priceToday: 350,
    cagr20y: 0.155,
    cagr10y: 0.247,
    story: "2006년 IPO 2년차. 2016년 알파벳 재편. 오늘 검색·유튜브·클라우드·AI.",
    source: "Macrotrends (분할조정)",
  },
  {
    ticker: "BRK.B",
    company: "버크셔 해서웨이",
    emoji: "🎩",
    price20yAgo: 59.0,
    price10yAgo: 144.0,
    priceToday: 473,
    cagr20y: 0.110,
    cagr10y: 0.126,
    story: "버핏의 지주회사. 단일 종목 아님 = 미국 최고 기업들의 묶음. 가장 보수적이지만 꾸준.",
    source: "StatMuse",
  },
];

// 월 적립식 미래가치 = (오늘 가격 / 과거 가격) 비율로 단순화한 lump 환산
// 정확한 월 적립 시뮬레이션 (DCA): 매월 같은 금액으로 사면 평균 매수가가 형성됨
// 여기선 직관적 계산: "월 X원씩 N년 = 매월 그 시점 가격으로 매수 → 오늘 가치"
// 단순화 위해 CAGR 기반 적립식 미래가치 공식 사용
export function dcaFutureValue(monthlyKRW: number, years: number, annualRate: number): number {
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return monthlyKRW * months;
  return monthlyKRW * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

export function lumpFutureValue(amountKRW: number, multiplier: number): number {
  return amountKRW * multiplier;
}
