// 🧠 사고방식 훈련형 투자 퀴즈
// 카테고리: risk (위험 이해), psychology (심리 조절), crisis (위기 대처), judgment (판단력)

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QuizCategory = "risk" | "psychology" | "crisis" | "judgment";

export interface OXQuestion {
  format: "ox";
  difficulty: Difficulty;
  statement: string;
  answer: boolean;
  explanation: string;
  category: QuizCategory;
  insight?: string; // 왜 이 사고방식이 중요한지
}

export interface MultipleChoiceQuestion {
  format: "multiple_choice";
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: QuizCategory;
  insight?: string;
}

export interface FillBlankQuestion {
  format: "fill_blank";
  difficulty: Difficulty;
  sentence: string;
  answer: string;
  hints?: string[];
  explanation: string;
  category: QuizCategory;
  insight?: string;
}

export type QuizQuestion = OXQuestion | MultipleChoiceQuestion | FillBlankQuestion;

// 카테고리 한글명
export const categoryLabels: Record<QuizCategory, { name: string; emoji: string; color: string }> = {
  risk: { name: "위험 이해", emoji: "🎯", color: "#EF4444" },
  psychology: { name: "심리 조절", emoji: "🧠", color: "#8B5CF6" },
  crisis: { name: "위기 대처", emoji: "🛡️", color: "#F59E0B" },
  judgment: { name: "판단력", emoji: "⚖️", color: "#3B82F6" },
};

// ===== 위험 이해 (Risk) =====
const riskQuestions: QuizQuestion[] = [
  // Beginner O/X
  {
    format: "ox", difficulty: "beginner", category: "risk",
    statement: "투자에서 리스크가 없다는 말을 들으면 안심해도 된다",
    answer: false,
    explanation: "하워드 막스: '투자에서 가장 위험한 것은 리스크가 없다는 믿음이다.' 리스크가 보이지 않을 때가 가장 위험해요.",
    insight: "리스크를 느끼지 못하는 순간이 가장 위험합니다. 이 감각을 키우는 것이 투자의 시작이에요.",
  },
  {
    format: "ox", difficulty: "beginner", category: "risk",
    statement: "분산 투자를 하면 모든 리스크가 사라진다",
    answer: false,
    explanation: "분산 투자는 개별 종목 리스크를 줄여주지만, 시장 전체 리스크(체계적 위험)는 제거할 수 없어요.",
    insight: "리스크는 제거하는 것이 아니라 이해하고 관리하는 것입니다.",
  },
  {
    format: "ox", difficulty: "beginner", category: "risk",
    statement: "과거에 많이 오른 주식은 앞으로도 계속 오를 확률이 높다",
    answer: false,
    explanation: "과거 성과는 미래를 보장하지 않아요. 이것은 투자의 가장 기본적인 경고문이에요.",
    insight: "과거 데이터에 의존하는 것은 '백미러를 보며 운전하는 것'과 같아요.",
  },
  // Intermediate O/X
  {
    format: "ox", difficulty: "intermediate", category: "risk",
    statement: "변동성이 큰 주식은 항상 위험한 투자다",
    answer: false,
    explanation: "변동성과 리스크는 다릅니다. 변동성은 가격의 흔들림이고, 진짜 리스크는 영구적 자본 손실이에요.",
    insight: "변동성을 두려워하면 기회를 놓치고, 리스크를 무시하면 자본을 잃어요. 둘을 구분하는 눈이 필요합니다.",
  },
  {
    format: "ox", difficulty: "intermediate", category: "risk",
    statement: "레버리지(빚투)를 사용하면 수익이 2배가 되니까 항상 유리하다",
    answer: false,
    explanation: "레버리지는 이익도 2배지만 손실도 2배예요. 시장이 50% 떨어지면 원금 전부를 잃을 수 있어요.",
    insight: "살아남아야 이길 수 있어요. 레버리지는 생존 확률을 낮추는 가장 확실한 방법입니다.",
  },
  // Advanced O/X
  {
    format: "ox", difficulty: "advanced", category: "risk",
    statement: "블랙 스완(극단적 사건)은 예측할 수 없기 때문에 대비할 필요가 없다",
    answer: false,
    explanation: "나심 탈레브: '예측할 수 없는 사건에 대비하는 것이 핵심이다.' 대비가 곧 생존입니다.",
    insight: "좋은 투자자는 미래를 예측하지 않습니다. 어떤 미래가 와도 살아남을 수 있도록 준비합니다.",
  },
  // Multiple Choice
  {
    format: "multiple_choice", difficulty: "beginner", category: "risk",
    question: "투자에서 '리스크'의 진짜 의미는?",
    options: ["영구적으로 돈을 잃을 가능성", "주가가 오르내리는 것", "뉴스에 나쁜 소식이 나오는 것", "환율이 변하는 것"],
    correctIndex: 0,
    explanation: "변동성은 리스크가 아니에요. 진짜 리스크는 투자한 돈을 영구적으로 잃는 것입니다.",
    insight: "이 구분을 아는 것만으로도 공포에 팔고 탐욕에 사는 실수를 크게 줄일 수 있어요.",
  },
  {
    format: "multiple_choice", difficulty: "intermediate", category: "risk",
    question: "당신이 투자한 주식이 30% 떨어졌습니다. 가장 먼저 해야 할 것은?",
    options: [
      "기업의 기본 가치가 변했는지 확인한다",
      "즉시 손절한다",
      "물타기로 더 산다",
      "뉴스를 보고 따라한다",
    ],
    correctIndex: 0,
    explanation: "가격이 떨어졌다는 사실보다 '왜' 떨어졌는지가 중요해요. 기업 가치가 변하지 않았다면 오히려 기회일 수 있어요.",
    insight: "감정이 아닌 '이유'에 집중하는 습관이 위기에서 살아남는 핵심이에요.",
  },
  {
    format: "multiple_choice", difficulty: "advanced", category: "risk",
    question: "나심 탈레브의 '안티프래질' 개념에 가장 가까운 것은?",
    options: [
      "충격을 받을수록 더 강해지는 시스템",
      "절대 깨지지 않는 방어",
      "모든 리스크를 완전히 제거하는 것",
      "변동성이 없는 안정적인 포트폴리오",
    ],
    correctIndex: 0,
    explanation: "안티프래질은 단순히 튼튼한 게 아니라, 혼란과 충격에서 오히려 이익을 얻는 상태예요.",
    insight: "위기를 피하려고만 하지 마세요. 위기에서 성장하는 구조를 만드는 것이 진짜 실력이에요.",
  },
  // Fill Blank
  {
    format: "fill_blank", difficulty: "beginner", category: "risk",
    sentence: "투자의 첫 번째 규칙: '절대 ___을 잃지 마라'",
    answer: "돈", hints: ["원금", "돈"],
    explanation: "워런 버핏의 가장 유명한 규칙. 규칙 2: '규칙 1을 절대 잊지 마라.'",
    insight: "수익을 추구하기 전에 원금을 지키는 것이 먼저입니다. 생존이 곧 승리예요.",
  },
  {
    format: "fill_blank", difficulty: "intermediate", category: "risk",
    sentence: "하워드 막스: '투자에서 가장 위험한 것은 ___가 없다는 믿음이다'",
    answer: "리스크", hints: ["리스크", "위험"],
    explanation: "모두가 안전하다고 느낄 때 자산 가격은 위험 수준까지 올라가 있어요.",
    insight: "시장이 가장 안전해 보일 때 가장 조심해야 합니다. 이것이 역발상의 핵심이에요.",
  },
];

// ===== 심리 조절 (Psychology) =====
const psychologyQuestions: QuizQuestion[] = [
  {
    format: "ox", difficulty: "beginner", category: "psychology",
    statement: "주식이 떨어질 때 불안한 마음은 비정상적인 반응이다",
    answer: false,
    explanation: "손실 회피 본능은 인간의 자연스러운 심리예요. 문제는 이 감정에 '반응'하는 것이에요.",
    insight: "감정을 느끼는 것은 자연스러워요. 중요한 건 감정이 아니라, 감정에 대한 '행동'이에요.",
  },
  {
    format: "ox", difficulty: "beginner", category: "psychology",
    statement: "뉴스에서 '공포'라는 단어가 많이 나올 때는 주식을 무조건 팔아야 한다",
    answer: false,
    explanation: "워런 버핏: '남들이 두려워할 때 탐욕스러워라.' 미디어의 공포는 종종 좋은 매수 기회의 신호예요.",
    insight: "미디어는 감정을 증폭시킵니다. 뉴스를 읽되, 뉴스에 휘둘리지 않는 능력이 필요해요.",
  },
  {
    format: "ox", difficulty: "intermediate", category: "psychology",
    statement: "매일 주가를 확인하는 것이 장기 투자에 도움이 된다",
    answer: false,
    explanation: "잦은 확인은 불안과 충동적 매매를 유발해요. 분기별 체크가 더 건강합니다.",
    insight: "확인 빈도를 줄이면 감정적 결정도 줄어요. 좋은 투자는 '지루한' 투자예요.",
  },
  {
    format: "ox", difficulty: "intermediate", category: "psychology",
    statement: "손실이 난 주식을 팔기 싫은 것은 합리적인 판단이다",
    answer: false,
    explanation: "이것은 '처분 효과'라는 심리 편향이에요. 이익은 빨리 실현하고 손실은 오래 끌어안는 경향.",
    insight: "팔기 싫은 감정과 팔면 안 되는 이유는 다릅니다. 감정과 분석을 구분하는 연습이 필요해요.",
  },
  {
    format: "ox", difficulty: "advanced", category: "psychology",
    statement: "자신의 투자 판단에 확신이 강할수록 좋은 투자자다",
    answer: false,
    explanation: "과잉 확신은 가장 위험한 편향 중 하나예요. 좋은 투자자는 항상 '내가 틀릴 수 있다'고 생각해요.",
    insight: "확신이 아니라 겸손함이 생존의 열쇠입니다. '내가 모르는 것이 뭘까?'를 항상 물어보세요.",
  },
  // MC
  {
    format: "multiple_choice", difficulty: "beginner", category: "psychology",
    question: "친구들이 모두 특정 주식을 사서 큰 수익을 냈다고 합니다. 당신의 반응은?",
    options: [
      "내 투자 원칙에 맞는지 먼저 분석한다",
      "나도 빨리 따라 산다",
      "이미 늦었으니 더 많이 산다",
      "SNS에서 추천 종목을 더 찾아본다",
    ],
    correctIndex: 0,
    explanation: "FOMO(놓칠까 봐 두려운 심리)는 가장 흔한 투자 실수의 원인이에요. 원칙이 감정을 이겨야 해요.",
    insight: "남들이 돈을 벌었다는 소식은 '정보'가 아니라 '감정 자극'이에요. 구분할 줄 알아야 해요.",
  },
  {
    format: "multiple_choice", difficulty: "intermediate", category: "psychology",
    question: "'앵커링 효과'에 빠진 투자자의 행동은?",
    options: [
      "매수 가격에 집착해서 합리적 판단을 못한다",
      "항상 최저가에 매수한다",
      "뉴스에 영향받지 않는다",
      "여러 종목에 골고루 투자한다",
    ],
    correctIndex: 0,
    explanation: "내가 산 가격은 시장에게 아무 의미 없어요. 중요한 건 '지금 이 기업의 가치가 어떤가'예요.",
    insight: "매수 가격을 잊으세요. 지금 이 가격에 다시 살 것인지를 물어보는 것이 올바른 질문이에요.",
  },
  {
    format: "multiple_choice", difficulty: "advanced", category: "psychology",
    question: "다니엘 카너먼에 따르면, 인간은 같은 크기의 이익보다 손실을 약 몇 배 더 크게 느끼나요?",
    options: ["약 2~2.5배", "약 1.2배", "약 5배", "동일하게 느낀다"],
    correctIndex: 0,
    explanation: "10만원 벌 때의 기쁨보다 10만원 잃을 때의 고통이 2배 이상 커요. 이게 '손실 회피'의 핵심.",
    insight: "이 비대칭을 이해하면 왜 대부분의 사람이 하락장에서 패닉 매도하는지 알 수 있어요.",
  },
  // Fill Blank
  {
    format: "fill_blank", difficulty: "beginner", category: "psychology",
    sentence: "벤자민 그레이엄: '투자의 가장 큰 적은 시장이 아니라 자기 자신의 ___이다'",
    answer: "감정", hints: ["마음", "감정"],
    explanation: "공포와 탐욕을 다스리는 것이 투자의 핵심이에요.",
    insight: "시장을 이기려 하지 마세요. 자신의 감정을 이기면 시장은 알아서 보상해줘요.",
  },
  {
    format: "fill_blank", difficulty: "intermediate", category: "psychology",
    sentence: "워런 버핏: '남들이 탐욕스러울 때 ___, 남들이 두려워할 때 탐욕스러워라'",
    answer: "두려워하고", hints: ["두려워", "공포"],
    explanation: "시장의 극단적 감정과 반대로 행동하라는 역발상 투자의 핵심!",
    insight: "군중과 반대로 움직이는 것은 쉽지 않아요. 하지만 그래서 소수만 성공하는 거예요.",
  },
];

// ===== 위기 대처 (Crisis) =====
const crisisQuestions: QuizQuestion[] = [
  {
    format: "ox", difficulty: "beginner", category: "crisis",
    statement: "주식 시장은 역사상 모든 대폭락에서 결국 회복했다",
    answer: true,
    explanation: "대공황, 닷컴 버블, 2008 금융위기, 코로나... 시장은 항상 돌아왔어요. 문제는 '당신이 버틸 수 있는가'예요.",
    insight: "시장은 회복합니다. 하지만 패닉에 팔고 나간 사람은 회복을 경험하지 못해요.",
  },
  {
    format: "ox", difficulty: "beginner", category: "crisis",
    statement: "폭락장에서 가장 좋은 전략은 뉴스를 끄고 아무것도 안 하는 것이다",
    answer: true,
    explanation: "대부분의 경우, 폭락장에서 '아무것도 안 하는 것'이 패닉 매도보다 훨씬 나은 결과를 가져와요.",
    insight: "행동하지 않는 것도 전략입니다. 때로는 '아무것도 안 하는 용기'가 가장 어려워요.",
  },
  {
    format: "ox", difficulty: "intermediate", category: "crisis",
    statement: "2008년 금융위기 때 S&P 500에서 버틴 투자자는 3년 안에 원금을 회복했다",
    answer: true,
    explanation: "2009년 3월 바닥 이후 S&P 500은 약 2년 만에 위기 전 수준을 회복했어요.",
    insight: "역사는 '버틴 사람이 이긴다'는 것을 반복적으로 증명하고 있어요.",
  },
  {
    format: "ox", difficulty: "advanced", category: "crisis",
    statement: "최고 상승일 10일을 놓치면 장기 수익률이 절반 이하로 떨어진다",
    answer: true,
    explanation: "최대 상승일은 대부분 최대 하락일 직후에 발생해요. 시장을 떠나면 반등도 놓쳐요.",
    insight: "시장 타이밍을 맞추려는 시도가 가장 비싼 실수예요. 시장에 '머무는 것'이 핵심이에요.",
  },
  // MC
  {
    format: "multiple_choice", difficulty: "beginner", category: "crisis",
    question: "시장이 하루 만에 10% 폭락했습니다. 당신의 선택은?",
    options: [
      "아무것도 하지 않고 원래 계획을 유지한다",
      "전부 매도해서 현금화한다",
      "레버리지로 더 산다",
      "친구에게 물어보고 따라한다",
    ],
    correctIndex: 0,
    explanation: "폭락 직후의 결정은 거의 항상 감정적이에요. 미리 세운 계획을 따르는 것이 최선입니다.",
    insight: "위기는 '준비된 사람'과 '즉흥적인 사람'을 가려내요. 계획은 폭풍이 오기 전에 세우는 것.",
  },
  {
    format: "multiple_choice", difficulty: "intermediate", category: "crisis",
    question: "2020년 코로나 폭락 때 워런 버핏의 행동은?",
    options: [
      "항공주를 매도하고 현금을 비축했다",
      "패닉에 모든 주식을 팔았다",
      "레버리지로 대규모 매수했다",
      "주식 시장에서 완전히 은퇴했다",
    ],
    correctIndex: 0,
    explanation: "버핏은 산업 전망이 변한 항공주를 정리했지만, 다른 좋은 기업은 유지했어요. 선택적 판단이 핵심!",
    insight: "위기에서도 냉정한 분석이 가능해야 해요. '전부 팔기'나 '전부 사기'는 감정적 반응이에요.",
  },
  {
    format: "multiple_choice", difficulty: "advanced", category: "crisis",
    question: "레이 달리오가 경제 위기에 대비하는 핵심 원칙은?",
    options: [
      "어떤 경제 환경에서도 작동하는 포트폴리오를 구성한다",
      "위기 직전에 모든 주식을 매도한다",
      "금에만 투자한다",
      "현금을 100% 보유한다",
    ],
    correctIndex: 0,
    explanation: "올웨더 포트폴리오: 인플레이션, 디플레이션, 성장, 침체 어떤 환경에서도 안정적으로 작동하도록 설계.",
    insight: "미래를 예측하려 하지 말고, 어떤 미래가 와도 괜찮은 구조를 만드세요.",
  },
  // Fill Blank
  {
    format: "fill_blank", difficulty: "beginner", category: "crisis",
    sentence: "주식 시장 격언: 'Time in the market beats timing ___'",
    answer: "the market", hints: ["the market", "시장"],
    explanation: "시장에 머무는 시간이 시장 타이밍을 맞추려는 시도보다 항상 이겨요.",
    insight: "매일의 등락에 반응하지 마세요. 시간이 당신의 가장 큰 무기예요.",
  },
  {
    format: "fill_blank", difficulty: "intermediate", category: "crisis",
    sentence: "피터 린치: '폭락에 대비하느라 잃는 돈이 폭락 ___에서 잃는 돈보다 더 많다'",
    answer: "자체", hints: ["자체", "그 자체"],
    explanation: "폭락을 기다리며 투자하지 않는 것도 기회비용이에요.",
    insight: "완벽한 타이밍을 기다리다가 시간을 낭비하지 마세요. 시장 참여가 가장 중요해요.",
  },
];

// ===== 판단력 (Judgment) =====
const judgmentQuestions: QuizQuestion[] = [
  {
    format: "ox", difficulty: "beginner", category: "judgment",
    statement: "유명한 투자자가 추천한 주식은 무조건 사야 한다",
    answer: false,
    explanation: "어떤 전문가도 100% 맞지 않아요. 중요한 건 '왜'라는 이유를 스스로 이해하는 것이에요.",
    insight: "남의 결론이 아니라, 자신만의 판단 근거를 갖는 것이 진짜 실력이에요.",
  },
  {
    format: "ox", difficulty: "beginner", category: "judgment",
    statement: "좋은 기업과 좋은 투자는 항상 같은 것이다",
    answer: false,
    explanation: "좋은 기업이라도 너무 비싼 가격에 사면 나쁜 투자가 될 수 있어요. 가격이 중요해요!",
    insight: "기업의 질과 가격을 동시에 보는 것이 판단력이에요. 하나만 보면 반쪽짜리 판단이에요.",
  },
  {
    format: "ox", difficulty: "intermediate", category: "judgment",
    statement: "투자 결정은 빠르게 내릴수록 좋다",
    answer: false,
    explanation: "찰리 멍거: '큰 돈은 사는 것과 파는 것에서가 아니라, 기다리는 것에서 번다.'",
    insight: "좋은 판단은 시간이 걸려요. 서두르는 것은 거의 항상 감정의 신호예요.",
  },
  {
    format: "ox", difficulty: "advanced", category: "judgment",
    statement: "하워드 막스의 '2차적 사고'는 남들의 생각까지 고려하는 역발상 사고다",
    answer: true,
    explanation: "'이 주식이 좋다'가 1차 사고, '남들은 어떻게 생각하고 그것이 가격에 반영됐는가'가 2차 사고예요.",
    insight: "대부분의 사람은 1차적으로만 생각해요. 한 단계 더 생각하면 시장을 이길 수 있어요.",
  },
  // MC
  {
    format: "multiple_choice", difficulty: "beginner", category: "judgment",
    question: "투자 결정을 내릴 때 가장 중요한 질문은?",
    options: [
      "'내가 틀릴 수 있는 이유는 무엇인가?'",
      "'얼마나 벌 수 있는가?'",
      "'다른 사람들은 뭘 사는가?'",
      "'언제 가장 많이 오를까?'",
    ],
    correctIndex: 0,
    explanation: "찰리 멍거: '항상 뒤집어서 생각하라(Invert, always invert).' 반대 상황을 먼저 생각하세요.",
    insight: "수익 가능성보다 손실 가능성을 먼저 따지는 습관이 장기적으로 더 큰 수익을 가져다줘요.",
  },
  {
    format: "multiple_choice", difficulty: "intermediate", category: "judgment",
    question: "당신의 분석과 시장의 반응이 다를 때, 가장 현명한 태도는?",
    options: [
      "내 분석의 약점을 다시 점검한다",
      "시장이 틀렸다고 확신한다",
      "즉시 시장을 따라간다",
      "투자를 포기한다",
    ],
    correctIndex: 0,
    explanation: "시장이 틀릴 수도 있지만, 내가 틀릴 확률이 더 높아요. 겸손하게 재점검하는 것이 현명해요.",
    insight: "좋은 투자자는 확신에 빠지지 않아요. 항상 '내가 놓친 것이 있을까?'를 물어봐요.",
  },
  {
    format: "multiple_choice", difficulty: "advanced", category: "judgment",
    question: "찰리 멍거가 강조한 '능력의 원(Circle of Competence)'이란?",
    options: [
      "자기가 잘 아는 영역에만 투자하라",
      "가능한 많은 분야에 투자하라",
      "전문가의 의견을 따르라",
      "트렌드를 빠르게 좇으라",
    ],
    correctIndex: 0,
    explanation: "'적게 알더라도 확실히 알아야 한다.' 자신의 능력 범위를 아는 것이 진짜 지혜예요.",
    insight: "모르면서 아는 척하는 것이 가장 위험해요. '모른다'고 인정하는 것이 현명함의 시작이에요.",
  },
  // Fill Blank
  {
    format: "fill_blank", difficulty: "beginner", category: "judgment",
    sentence: "찰리 멍거: '항상 뒤집어서 생각하라. ___, always ___.'",
    answer: "Invert", hints: ["Invert", "뒤집어"],
    explanation: "성공하려면 어떻게 해야 할까가 아니라, '어떻게 하면 실패할까'를 먼저 생각하세요.",
    insight: "실패를 피하는 것이 성공을 추구하는 것보다 더 확실한 전략이에요.",
  },
  {
    format: "fill_blank", difficulty: "intermediate", category: "judgment",
    sentence: "피터 린치: '자기가 ___ 것에 투자하라'",
    answer: "아는", hints: ["아는", "이해하는"],
    explanation: "이해하지 못하는 기업에 투자하면 위기 때 확신을 가질 수 없어요.",
    insight: "이해하는 기업에 투자하면 폭락 때도 흔들리지 않아요. 확신은 이해에서 나옵니다.",
  },
  {
    format: "fill_blank", difficulty: "advanced", category: "judgment",
    sentence: "벤저민 그레이엄: 단기적으로 시장은 투표 기계이지만, 장기적으로는 ___ 기계다",
    answer: "저울", hints: ["저울", "체중계"],
    explanation: "단기에는 인기(감정)에 의해 움직이지만, 장기에는 기업의 실제 가치를 반영해요.",
    insight: "단기적 소음에 흔들리지 마세요. 장기적으로 가치는 반드시 인정받아요.",
  },
];

// Combine all questions
export const allQuestions: QuizQuestion[] = [
  ...riskQuestions,
  ...psychologyQuestions,
  ...crisisQuestions,
  ...judgmentQuestions,
];

// Map user level (1-6) to difficulty
function getDifficultyForLevel(level: number): Difficulty[] {
  if (level <= 2) return ["beginner"];
  if (level <= 4) return ["beginner", "intermediate"];
  return ["intermediate", "advanced"];
}

// Get quiz set based on user level — ensures category diversity
export function getDailyQuizSet(count: number, userLevel: number = 1): QuizQuestion[] {
  const difficulties = getDifficultyForLevel(userLevel);
  const categories: QuizCategory[] = ["risk", "psychology", "crisis", "judgment"];

  const result: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    // Rotate through categories for diversity
    const targetCategory = categories[i % categories.length];
    const pool = allQuestions.filter(
      (q) => q.category === targetCategory && difficulties.includes(q.difficulty)
    );

    const unused = pool.filter(
      (q) => !result.some((r) => r === q)
    );

    const pick = unused.length > 0 ? unused : pool;
    if (pick.length > 0) {
      result.push(pick[Math.floor(Math.random() * pick.length)]);
    }
  }

  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Get a random question
export function getRandomQuiz(): QuizQuestion {
  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}
