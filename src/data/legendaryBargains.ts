// 역사 속 헐값 카드 — 전설적 투자자들의 매수가와 오늘의 가치
// ⚠️ 미래 예측이 아닌 "역사적 사실" 기록. 가격은 분할 조정 기준 근사치.

export interface LegendaryBargain {
  id: string;
  ticker: string;
  company: string;
  investor: string;
  investorEmoji: string;
  buyYear: number;
  buyPriceLabel: string;        // "약 $2.45 (분할조정)"
  todayPriceLabel: string;      // "약 $185"
  multiplier: number;           // 75 → 75배
  story: string;                // 당시 분위기 + 왜 헐값이었는지
  lesson: string;               // 사용자에게 전달할 한 문장
  category: "consumer" | "tech" | "finance" | "industrial";
}

export const LEGENDARY_BARGAINS: LegendaryBargain[] = [
  {
    id: "buffett-ko-1988",
    ticker: "KO",
    company: "코카콜라",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1988,
    buyPriceLabel: "약 $2.45 (분할조정)",
    todayPriceLabel: "약 $68",
    multiplier: 28,
    story: "1987년 블랙먼데이 직후, 시장은 공포에 잠겨 있었어요. 모두가 '이제 끝났다'고 외칠 때 버핏은 코카콜라 주식을 10억 달러어치 매수했습니다. 사람들은 '너무 비싸다'고 했지만, 버핏은 '평생 마실 음료'라며 흔들리지 않았어요.",
    lesson: "당시엔 비싸 보였던 가격이, 36년 뒤엔 28배가 되었어요.",
    category: "consumer",
  },
  {
    id: "buffett-aapl-2016",
    ticker: "AAPL",
    company: "애플",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 2016,
    buyPriceLabel: "약 $25 (분할조정)",
    todayPriceLabel: "약 $185",
    multiplier: 7.4,
    story: "버핏은 평생 '기술주는 모른다'며 피했지만 2016년 애플을 매수했어요. 이유는 단순했어요 — '내 가족과 친구 모두가 아이폰을 쓴다. 이건 기술 회사가 아니라 소비재 회사다.' 그 후 8년간 7배 이상 성장했습니다.",
    lesson: "내가 매일 쓰는 제품의 회사 — 그게 가장 강력한 기업입니다.",
    category: "tech",
  },
  {
    id: "lynch-dunkin-1980s",
    ticker: "DNKN",
    company: "던킨도넛",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1982,
    buyPriceLabel: "당시 약 $2",
    todayPriceLabel: "$106 (2020년 인수가)",
    multiplier: 53,
    story: "피터 린치는 '내가 매일 사 먹는 도넛 가게'를 분석했어요. 화려한 기술도, 어려운 비즈니스 모델도 아니었어요. 그저 사람들이 줄을 서서 산다는 사실 하나로 충분했습니다.",
    lesson: "'내가 이해할 수 있는 사업'이 가장 안전한 투자입니다.",
    category: "consumer",
  },
  {
    id: "lynch-wmt-1980s",
    ticker: "WMT",
    company: "월마트",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1980,
    buyPriceLabel: "약 $0.07 (분할조정)",
    todayPriceLabel: "약 $85",
    multiplier: 1200,
    story: "1980년 월마트는 미국 시골에만 있는 작은 할인점이었어요. 월스트리트는 무시했지만 린치는 '아직 미국 절반에 진출도 안 했다'며 매수했습니다.",
    lesson: "성장 여지가 큰 1등 기업은 시간이 가장 강력한 동맹입니다.",
    category: "consumer",
  },
  {
    id: "buffett-amex-1964",
    ticker: "AXP",
    company: "아메리칸 익스프레스",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1964,
    buyPriceLabel: "약 $1.50 (분할조정)",
    todayPriceLabel: "약 $245",
    multiplier: 163,
    story: "1963년 '샐러드 오일 스캔들'로 아멕스 주가는 반토막 났어요. 모두가 '망했다'고 했지만 버핏은 식당에서 사람들이 여전히 아멕스 카드로 결제하는 걸 봤어요. 그래서 매수했습니다.",
    lesson: "위기는 일시적, 브랜드는 영구적. 이게 버핏의 원칙입니다.",
    category: "finance",
  },
  {
    id: "buffett-gei-2008",
    ticker: "GS",
    company: "골드만삭스",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 2008,
    buyPriceLabel: "약 $115 (우선주)",
    todayPriceLabel: "약 $430",
    multiplier: 3.7,
    story: "2008년 금융위기 한복판, 모두가 골드만삭스도 무너질 거라 했어요. 버핏은 50억 달러를 투자했고 '미국에 베팅하는 것'이라 말했습니다. 16년 뒤 정답이 드러났어요.",
    lesson: "공포가 극에 달할 때, 최고의 회사가 가장 싸집니다.",
    category: "finance",
  },
  {
    id: "lynch-mcd-1980s",
    ticker: "MCD",
    company: "맥도날드",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1980,
    buyPriceLabel: "약 $1.30 (분할조정)",
    todayPriceLabel: "약 $290",
    multiplier: 223,
    story: "린치는 '맥도날드는 부동산 회사'라고 했어요. 어디서나 똑같은 햄버거, 어디서나 똑같은 매장 — 이 단순함이 40년간 200배의 수익을 만들었습니다.",
    lesson: "단순한 비즈니스 모델 + 글로벌 확장 = 시간의 마법.",
    category: "consumer",
  },
  {
    id: "buffett-wfc-1990",
    ticker: "WFC",
    company: "웰스파고",
    investor: "워렌 버핏",
    investorEmoji: "🎩",
    buyYear: 1990,
    buyPriceLabel: "약 $11 (분할조정)",
    todayPriceLabel: "약 $58",
    multiplier: 5.3,
    story: "1990년 캘리포니아 부동산 위기로 웰스파고 주가가 폭락했어요. 버핏은 '은행은 시장이 가장 두려워할 때 사야 한다'며 매수했습니다.",
    lesson: "위기 속 1등 기업 — 이 공식은 100년째 유효합니다.",
    category: "finance",
  },
  {
    id: "lynch-ford-1980s",
    ticker: "F",
    company: "포드",
    investor: "피터 린치",
    investorEmoji: "👓",
    buyYear: 1982,
    buyPriceLabel: "약 $1.50 (분할조정)",
    todayPriceLabel: "약 $11",
    multiplier: 7.3,
    story: "1980년대 초, 미국 자동차 산업은 '끝났다'고 했어요. 일본차에 밀려서요. 하지만 린치는 신차 라인업과 매장 방문객을 직접 세어보고 매수했습니다.",
    lesson: "신문 헤드라인보다 '내 눈으로 본 사실'을 믿으세요.",
    category: "industrial",
  },
  {
    id: "buffett-msft-philosophy",
    ticker: "MSFT",
    company: "마이크로소프트",
    investor: "장기투자 일반론",
    investorEmoji: "📊",
    buyYear: 2009,
    buyPriceLabel: "약 $19 (금융위기 저점)",
    todayPriceLabel: "약 $420",
    multiplier: 22,
    story: "2009년 금융위기 직후, MSFT는 '한물갔다'는 평가를 받았어요. 그런데 15년 뒤 클라우드 시대를 이끌며 22배가 되었습니다. 위기는 1등 기업을 떨이로 살 기회였어요.",
    lesson: "'한물갔다'고 평가받는 1등 기업이 종종 가장 큰 기회입니다.",
    category: "tech",
  },
];

// 시뮬레이터에서 사용 — 사용자 보유 종목 카테고리에 맞는 사례 추천
export function findClosestBargain(ticker: string): LegendaryBargain | undefined {
  return LEGENDARY_BARGAINS.find((b) => b.ticker === ticker);
}

export function findBargainsByCategory(category: LegendaryBargain["category"]): LegendaryBargain[] {
  return LEGENDARY_BARGAINS.filter((b) => b.category === category);
}
