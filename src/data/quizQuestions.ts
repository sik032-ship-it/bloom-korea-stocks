// Investment philosophy quiz questions for Duolingo-style daily lessons

export interface OXQuestion {
  format: "ox";
  statement: string;
  answer: boolean; // true = O, false = X
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export interface MultipleChoiceQuestion {
  format: "multiple_choice";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export interface FillBlankQuestion {
  format: "fill_blank";
  sentence: string; // Use ___ for blank
  answer: string;
  hints?: string[];
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export type QuizQuestion = OXQuestion | MultipleChoiceQuestion | FillBlankQuestion;

// ===== O/X 퀴즈 (참/거짓) =====
export const oxQuestions: OXQuestion[] = [
  {
    format: "ox",
    statement: "주가가 떨어지면 항상 손절매를 해야 한다",
    answer: false,
    explanation: "장기투자에서는 기업의 펀더멘털이 변하지 않았다면 하락은 오히려 추가 매수 기회가 될 수 있어요.",
    category: "philosophy",
  },
  {
    format: "ox",
    statement: "워런 버핏은 '남들이 두려워할 때 탐욕스러워라'고 말했다",
    answer: true,
    explanation: "맞아요! 시장의 공포가 극에 달할 때가 종종 좋은 매수 기회가 됩니다.",
    category: "philosophy",
  },
  {
    format: "ox",
    statement: "분산 투자는 리스크를 완전히 제거해 준다",
    answer: false,
    explanation: "분산 투자는 비체계적 위험을 줄여주지만, 시장 전체 위험(체계적 위험)은 제거할 수 없어요.",
    category: "basics",
  },
  {
    format: "ox",
    statement: "S&P 500 지수는 장기적으로 연평균 약 10%의 수익률을 기록해왔다",
    answer: true,
    explanation: "역사적으로 S&P 500은 배당 포함 연평균 약 10%의 수익률을 보여왔어요.",
    category: "basics",
  },
  {
    format: "ox",
    statement: "주식 투자에서 감정적 결정은 대부분 좋은 결과를 가져온다",
    answer: false,
    explanation: "감정적 매매는 높을 때 사고 낮을 때 파는 패턴을 만들어요. 원칙에 기반한 투자가 중요합니다.",
    category: "psychology",
  },
  {
    format: "ox",
    statement: "PER(주가수익비율)이 낮을수록 항상 좋은 투자다",
    answer: false,
    explanation: "낮은 PER이 반드시 저평가를 의미하지 않아요. 기업의 성장성, 업종 특성도 함께 봐야 해요.",
    category: "basics",
  },
  {
    format: "ox",
    statement: "복리의 효과는 투자 기간이 길수록 강력해진다",
    answer: true,
    explanation: "아인슈타인이 '세상에서 가장 강력한 힘'이라고 한 복리! 시간이 최고의 무기예요.",
    category: "philosophy",
  },
  {
    format: "ox",
    statement: "좋은 기업의 주식은 비쌀 때 사도 장기적으로 괜찮다",
    answer: true,
    explanation: "피터 린치: '좋은 기업은 시간이 해결해준다.' 물론 합리적 가격이면 더 좋겠죠!",
    category: "strategy",
  },
  {
    format: "ox",
    statement: "매일 주가를 확인하는 것이 장기투자에 도움이 된다",
    answer: false,
    explanation: "잦은 확인은 오히려 불안과 충동적 매매를 유발해요. 분기별 체크가 더 건강합니다.",
    category: "psychology",
  },
  {
    format: "ox",
    statement: "달러 코스트 에버리징(적립식 투자)은 시장 타이밍 위험을 줄여준다",
    answer: true,
    explanation: "매월 일정액을 투자하면 평균 매수 단가를 낮추고 타이밍 리스크를 분산할 수 있어요.",
    category: "strategy",
  },
  {
    format: "ox",
    statement: "과거 수익률이 좋은 펀드는 미래에도 좋은 성과를 낼 확률이 높다",
    answer: false,
    explanation: "과거 성과가 미래를 보장하지 않아요. 투자의 가장 기본적인 경고문이죠!",
    category: "basics",
  },
  {
    format: "ox",
    statement: "찰리 멍거는 '적게 알더라도 확실히 알아야 한다'고 말했다",
    answer: true,
    explanation: "능력의 원(Circle of Competence) — 자신이 잘 아는 영역에 집중하라는 뜻이에요.",
    category: "philosophy",
  },
];

// ===== 객관식 4지선다 =====
export const multipleChoiceQuestions: MultipleChoiceQuestion[] = [
  {
    format: "multiple_choice",
    question: "워런 버핏의 투자 원칙 1번은?",
    options: ["절대 돈을 잃지 마라", "빠르게 매매하라", "레버리지를 활용하라", "유행을 따르라"],
    correctIndex: 0,
    explanation: "버핏의 원칙 1: 절대 돈을 잃지 마라. 원칙 2: 원칙 1을 절대 잊지 마라!",
    category: "philosophy",
  },
  {
    format: "multiple_choice",
    question: "'경제적 해자(Economic Moat)'란 무엇인가요?",
    options: [
      "기업의 지속적 경쟁 우위",
      "주가의 저항선",
      "정부의 규제 장벽",
      "CEO의 경영 능력",
    ],
    correctIndex: 0,
    explanation: "경제적 해자는 기업이 경쟁사로부터 이익을 보호할 수 있는 지속적인 경쟁 우위를 말해요.",
    category: "basics",
  },
  {
    format: "multiple_choice",
    question: "주식 시장이 폭락할 때 장기투자자가 해야 할 일은?",
    options: [
      "투자 원칙을 다시 점검한다",
      "모든 주식을 즉시 팔다",
      "뉴스를 계속 확인한다",
      "레버리지로 공매도한다",
    ],
    correctIndex: 0,
    explanation: "폭락 시에는 패닉 셀링을 피하고, 자신의 투자 원칙과 기업의 펀더멘털을 재점검하는 것이 중요해요.",
    category: "strategy",
  },
  {
    format: "multiple_choice",
    question: "S&P 500에서 가장 큰 비중을 차지하는 섹터는? (2024 기준)",
    options: ["IT(정보기술)", "헬스케어", "금융", "에너지"],
    correctIndex: 0,
    explanation: "IT 섹터가 약 30% 이상의 비중을 차지하고 있어요. 애플, 마이크로소프트, 엔비디아 등이 포함돼요.",
    category: "basics",
  },
  {
    format: "multiple_choice",
    question: "'FOMO'는 무슨 뜻인가요?",
    options: [
      "놓칠까 봐 두려운 심리",
      "빠르게 수익을 내는 전략",
      "외국인 매도 지표",
      "펀드 운용 수수료",
    ],
    correctIndex: 0,
    explanation: "Fear Of Missing Out — 기회를 놓칠까 봐 서둘러 매수하는 심리예요. 조심해야 해요!",
    category: "psychology",
  },
  {
    format: "multiple_choice",
    question: "피터 린치가 강조한 투자 원칙은?",
    options: [
      "자기가 아는 것에 투자하라",
      "남들을 따라 투자하라",
      "주가 차트만 보고 투자하라",
      "항상 공매도도 함께하라",
    ],
    correctIndex: 0,
    explanation: "린치는 '자기가 잘 아는 기업에 투자하라'고 강조했어요. 일상에서 투자 아이디어를 찾으라는 뜻!",
    category: "philosophy",
  },
  {
    format: "multiple_choice",
    question: "배당주 투자의 가장 큰 장점은?",
    options: [
      "정기적인 현금 흐름 확보",
      "항상 주가가 오른다",
      "세금이 면제된다",
      "변동성이 0이다",
    ],
    correctIndex: 0,
    explanation: "배당은 주가와 별개로 정기적인 수입을 제공해요. 하락장에서도 심리적 안정감을 줘요!",
    category: "strategy",
  },
  {
    format: "multiple_choice",
    question: "투자에서 '72의 법칙'이란?",
    options: [
      "72를 수익률로 나누면 원금 2배 시간",
      "72개 종목에 분산하라",
      "72시간 내에 매매를 결정하라",
      "72% 이상 상승하면 매도하라",
    ],
    correctIndex: 0,
    explanation: "연 수익률 10%라면 72÷10=7.2년에 원금이 2배! 복리의 마법을 쉽게 계산하는 법이에요.",
    category: "basics",
  },
  {
    format: "multiple_choice",
    question: "주식 투자에서 '앵커링 효과'란?",
    options: [
      "처음 접한 가격에 집착하는 심리",
      "항구에서 주식을 사는 전략",
      "안전한 채권에 투자하는 방법",
      "자동 매매 시스템",
    ],
    correctIndex: 0,
    explanation: "매수 가격에 집착해서 이성적 판단을 못하는 심리편향이에요. 현재 가치로 판단해야 해요!",
    category: "psychology",
  },
  {
    format: "multiple_choice",
    question: "ETF의 가장 큰 장점은?",
    options: [
      "낮은 비용으로 분산 투자 가능",
      "100% 수익이 보장된다",
      "세금이 면제된다",
      "손실이 불가능하다",
    ],
    correctIndex: 0,
    explanation: "ETF는 낮은 수수료로 다양한 종목에 한번에 투자할 수 있어 초보자에게도 좋은 선택이에요.",
    category: "basics",
  },
];

// ===== 빈칸 채우기 =====
export const fillBlankQuestions: FillBlankQuestion[] = [
  {
    format: "fill_blank",
    sentence: "워런 버핏: '남들이 탐욕스러울 때 ___, 남들이 두려워할 때 탐욕스러워라'",
    answer: "두려워하고",
    hints: ["두려워", "공포"],
    explanation: "시장의 극단적 감정과 반대로 행동하라는 역발상 투자의 핵심이에요!",
    category: "philosophy",
  },
  {
    format: "fill_blank",
    sentence: "찰리 멍거: '좋은 기업을 적정한 가격에 사는 것이 평범한 기업을 ___ 가격에 사는 것보다 낫다'",
    answer: "싼",
    hints: ["저렴한", "싼"],
    explanation: "가치투자의 핵심! 싸다고 좋은 게 아니라, 좋은 기업이 중요해요.",
    category: "philosophy",
  },
  {
    format: "fill_blank",
    sentence: "투자의 가장 큰 적은 시장이 아니라 자기 자신의 ___이다",
    answer: "감정",
    hints: ["마음", "감정"],
    explanation: "벤자민 그레이엄의 명언이에요. 공포와 탐욕을 다스리는 것이 투자의 핵심!",
    category: "psychology",
  },
  {
    format: "fill_blank",
    sentence: "72의 법칙: 72를 연간 수익률로 나누면 원금이 ___배가 되는 데 걸리는 시간을 알 수 있다",
    answer: "2",
    hints: ["두", "2"],
    explanation: "연 수익률 8%라면 72÷8=9년이면 원금이 2배! 복리의 마법이죠.",
    category: "basics",
  },
  {
    format: "fill_blank",
    sentence: "장기투자에서 가장 강력한 무기는 ___이다",
    answer: "시간",
    hints: ["기간", "시간"],
    explanation: "복리 효과는 시간이 지날수록 기하급수적으로 커져요. 인내심이 곧 수익!",
    category: "philosophy",
  },
  {
    format: "fill_blank",
    sentence: "피터 린치: '주식 시장에서 돈을 잃는 것보다 ___ 준비하다가 잃는 돈이 더 많다'",
    answer: "조정에",
    hints: ["조정", "하락"],
    explanation: "폭락을 기다리며 투자하지 않는 것도 기회비용이에요. 적립식 투자가 답!",
    category: "strategy",
  },
  {
    format: "fill_blank",
    sentence: "경제적 ___란 기업이 경쟁사로부터 이익을 보호할 수 있는 지속적인 경쟁 우위를 말한다",
    answer: "해자",
    hints: ["해자", "moat"],
    explanation: "버핏이 즐겨 사용하는 개념으로, 브랜드, 네트워크 효과, 특허 등이 해당돼요.",
    category: "basics",
  },
  {
    format: "fill_blank",
    sentence: "달러 코스트 에버리징은 매월 ___액을 투자해 평균 매수 단가를 낮추는 전략이다",
    answer: "일정",
    hints: ["동일한", "일정"],
    explanation: "시장 타이밍을 맞추지 않아도 되니까 초보자에게 특히 좋은 전략이에요!",
    category: "strategy",
  },
  {
    format: "fill_blank",
    sentence: "존 보글: '건초 더미에서 바늘을 찾지 말고, 건초 더미 ___를 사라'",
    answer: "전체",
    hints: ["전체", "전부"],
    explanation: "인덱스 펀드의 아버지 보글의 철학! 시장 전체를 사면 승자를 고를 필요가 없어요.",
    category: "philosophy",
  },
  {
    format: "fill_blank",
    sentence: "투자에서 ___은 리스크를 줄이는 유일한 공짜 점심이다",
    answer: "분산",
    hints: ["분산", "다각화"],
    explanation: "해리 마코위츠의 명언! 달걀을 한 바구니에 담지 말라는 원칙이에요.",
    category: "strategy",
  },
];

// Get a random question of any format
export function getRandomQuiz(): QuizQuestion {
  const allQuestions: QuizQuestion[] = [
    ...oxQuestions,
    ...multipleChoiceQuestions,
    ...fillBlankQuestions,
  ];
  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}

// Get a random question by format
export function getRandomQuizByFormat(format: "ox" | "multiple_choice" | "fill_blank"): QuizQuestion {
  const pool =
    format === "ox"
      ? oxQuestions
      : format === "multiple_choice"
      ? multipleChoiceQuestions
      : fillBlankQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get a weighted random question (for daily lesson mix)
export function getDailyQuizSet(count: number): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  const formats: Array<"ox" | "multiple_choice" | "fill_blank"> = [
    "multiple_choice",
    "ox",
    "fill_blank",
  ];

  for (let i = 0; i < count; i++) {
    const format = formats[i % formats.length];
    const pool =
      format === "ox"
        ? [...oxQuestions]
        : format === "multiple_choice"
        ? [...multipleChoiceQuestions]
        : [...fillBlankQuestions];

    // Avoid duplicates
    const unused = pool.filter(
      (q) => !result.some((r) => {
        if (r.format === "ox" && q.format === "ox") return r.statement === q.statement;
        if (r.format === "multiple_choice" && q.format === "multiple_choice") return r.question === q.question;
        if (r.format === "fill_blank" && q.format === "fill_blank") return r.sentence === q.sentence;
        return false;
      })
    );

    const pick = unused.length > 0 ? unused : pool;
    result.push(pick[Math.floor(Math.random() * pick.length)]);
  }

  return result;
}
