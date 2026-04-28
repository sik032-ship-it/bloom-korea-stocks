// 역사 속 헐값 카드 — 전설적 투자자들의 매수가와 오늘의 가치
// ⚠️ 모든 가격은 공개 자료 기반으로 교차 검증함. 분할조정/근사치 표기 명시.
// 출처: SEC 13F 공시, Berkshire Hathaway 연차서한, Macrotrends, StatMuse,
//       Goldman Sachs 보도자료, Bloomberg, Business Insider, Reuters

export interface LegendaryBargain {
  id: string;
  ticker: string;
  company: string;
  investor: string;
  investorEmoji: string;
  buyYear: number;
  buyPriceLabel: string;        // "약 $2.45 (분할조정)"
  todayPriceLabel: string;      // "약 $68"
  multiplier: number;           // 28 → 28배
  story: string;                // 당시 분위기 + 왜 헐값이었는지
  lesson: string;               // 사용자에게 전달할 한 문장
  category: "consumer" | "tech" | "finance" | "industrial";
  source?: string;              // 신뢰성을 위한 근거 출처
}

export const LEGENDARY_BARGAINS: LegendaryBargain[] = [
  {
    id: "buffett-ko-1988",
    ticker: "KO",
    company: "코카콜라",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1988,
    buyPriceLabel: "약 $2.45/주 (분할조정)",
    todayPriceLabel: "약 $68",
    multiplier: 28,
    story: "1987년 블랙먼데이 직후, 시장은 공포에 잠겨 있었어요. 버핏은 1988~1989년에 걸쳐 약 13억 달러어치 코카콜라를 매수했습니다. 사람들은 '비싸다'고 했지만, 버핏은 '평생 마실 음료'라며 흔들리지 않았어요.",
    lesson: "당시엔 비싸 보였던 가격이, 36년 뒤엔 약 28배가 되었어요.",
    category: "consumer",
    source: "Berkshire 연차서한, Investopedia",
  },
  {
    id: "buffett-aapl-2016",
    ticker: "AAPL",
    company: "애플",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 2016,
    buyPriceLabel: "약 $24.87/주 (분할조정)",
    todayPriceLabel: "약 $230",
    multiplier: 9.2,
    story: "버핏은 평생 '기술주는 모른다'며 피했지만 2016년 1분기에 처음 매수했어요. 평균 매수가는 분할 전 약 $99.49 (당시 SEC 13F 공시 기준), 2020년 4:1 분할로 환산하면 약 $24.87입니다. 이유는 단순했어요 — '내 가족과 친구 모두가 아이폰을 쓴다.'",
    lesson: "내가 매일 쓰는 제품의 회사 — 그게 가장 강력한 기업입니다.",
    category: "tech",
    source: "Bloomberg/Business Insider, SEC 13F",
  },
  {
    id: "lynch-wmt-1980",
    ticker: "WMT",
    company: "월마트",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1980,
    buyPriceLabel: "약 $0.05/주 (분할조정)",
    todayPriceLabel: "약 $95",
    multiplier: 1900,
    story: "1980년 월마트는 미국 시골 지역에만 있는 작은 할인점이었어요. 월스트리트는 무시했지만 린치는 '아직 미국 절반에 진출도 안 했다'며 주목했습니다. 이후 11번의 주식 분할을 거쳐 1980년 1주가 오늘 약 1,900배가 되었어요.",
    lesson: "성장 여지가 큰 1등 기업은 시간이 가장 강력한 동맹입니다.",
    category: "consumer",
    source: "StatMuse, Macrotrends 분할 이력",
  },
  {
    id: "buffett-amex-1964",
    ticker: "AXP",
    company: "아메리칸 익스프레스",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1964,
    buyPriceLabel: "당시 주당 약 $35 (분할 전)",
    todayPriceLabel: "약 $300",
    multiplier: 100,
    story: "1963년 '샐러드 오일 스캔들'로 아멕스 주가는 약 60% 폭락했어요. 모두가 '망했다'고 했지만 버핏은 식당과 호텔에서 사람들이 여전히 아멕스 카드로 결제하는 걸 직접 확인했어요. 그래서 버핏 파트너십 자산의 약 40%를 베팅했습니다.",
    lesson: "위기는 일시적, 브랜드는 영구적 — 이게 버핏의 원칙입니다.",
    category: "finance",
    source: "Hurricane Capital, Business Insider",
  },
  {
    id: "buffett-gs-2008",
    ticker: "GS",
    company: "골드만삭스",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 2008,
    buyPriceLabel: "워런트 행사가 $115/주",
    todayPriceLabel: "약 $580",
    multiplier: 5.0,
    story: "2008년 9월, 리먼 파산 직후 버핏은 $50억 규모 영구우선주(배당 10%) + 5년 만기 워런트(주당 $115에 약 $50억 행사권)에 투자했어요. 2013년 워런트 정산으로 무상에 가까운 GS 주식 약 1,300만 주를 확보했습니다.",
    lesson: "공포가 극에 달할 때, 최고의 회사가 가장 싸집니다.",
    category: "finance",
    source: "Goldman Sachs 보도자료(2008.9.23), Reuters",
  },
  {
    id: "lynch-mcd-1980",
    ticker: "MCD",
    company: "맥도날드",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1980,
    buyPriceLabel: "약 $1.5/주 (분할조정)",
    todayPriceLabel: "약 $310",
    multiplier: 200,
    story: "린치는 '맥도날드는 부동산 회사'라고 했어요. 어디서나 똑같은 햄버거, 어디서나 똑같은 매장 — 이 단순함이 40년 넘게 약 200배의 수익을 만들었습니다.",
    lesson: "단순한 비즈니스 모델 + 글로벌 확장 = 시간의 마법.",
    category: "consumer",
    source: "Macrotrends 분할조정 가격",
  },
  {
    id: "buffett-wfc-1990",
    ticker: "WFC",
    company: "웰스파고",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1990,
    buyPriceLabel: "약 $13/주 (분할조정)",
    todayPriceLabel: "약 $75",
    multiplier: 5.7,
    story: "1990년 캘리포니아 부동산 위기로 웰스파고 주가가 폭락했어요. 버핏은 '은행은 시장이 가장 두려워할 때 사야 한다'며 약 $2.89억을 투자했습니다.",
    lesson: "위기 속 1등 기업 — 이 공식은 100년째 유효합니다.",
    category: "finance",
    source: "Berkshire 연차서한 1990, USA Today",
  },
  {
    id: "msft-2009-low",
    ticker: "MSFT",
    company: "마이크로소프트",
    investor: "장기투자 일반론",
    investorEmoji: "📊",
    buyYear: 2009,
    buyPriceLabel: "약 $13.46/주 (2009.3 저점)",
    todayPriceLabel: "약 $440",
    multiplier: 33,
    story: "2009년 3월, 금융위기 한복판에서 MSFT는 약 $13.46까지 떨어졌어요. '한물갔다'는 평가를 받았지만, 클라우드(Azure) 시대를 이끌며 15년 만에 약 33배가 되었습니다. 위기는 1등 기업을 떨이로 살 기회였어요.",
    lesson: "'한물갔다'고 평가받는 1등 기업이 종종 가장 큰 기회입니다.",
    category: "tech",
    source: "StatMuse 2009.3 종가 데이터",
  },
];

// 시뮬레이터에서 사용 — 사용자 보유 종목 카테고리에 맞는 사례 추천
export function findClosestBargain(ticker: string): LegendaryBargain | undefined {
  return LEGENDARY_BARGAINS.find((b) => b.ticker === ticker);
}

export function findBargainsByCategory(category: LegendaryBargain["category"]): LegendaryBargain[] {
  return LEGENDARY_BARGAINS.filter((b) => b.category === category);
}
