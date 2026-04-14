// Investment philosophy quiz questions with difficulty levels

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface OXQuestion {
  format: "ox";
  difficulty: Difficulty;
  statement: string;
  answer: boolean;
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export interface MultipleChoiceQuestion {
  format: "multiple_choice";
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export interface FillBlankQuestion {
  format: "fill_blank";
  difficulty: Difficulty;
  sentence: string;
  answer: string;
  hints?: string[];
  explanation: string;
  category: "philosophy" | "basics" | "psychology" | "strategy";
}

export type QuizQuestion = OXQuestion | MultipleChoiceQuestion | FillBlankQuestion;

// ===== BEGINNER O/X =====
const oxBeginner: OXQuestion[] = [
  { format: "ox", difficulty: "beginner", statement: "주식은 도박과 같다", answer: false, explanation: "주식은 기업의 일부를 소유하는 것이에요. 도박과 달리 경제 성장과 함께 가치가 올라갈 수 있어요.", category: "basics" },
  { format: "ox", difficulty: "beginner", statement: "S&P 500은 미국 대형 500개 기업을 모아놓은 지수다", answer: true, explanation: "맞아요! 미국 주식 시장을 대표하는 가장 유명한 지수예요.", category: "basics" },
  { format: "ox", difficulty: "beginner", statement: "주가가 떨어지면 항상 손절매를 해야 한다", answer: false, explanation: "장기투자에서는 기업의 펀더멘털이 변하지 않았다면 하락은 오히려 추가 매수 기회가 될 수 있어요.", category: "philosophy" },
  { format: "ox", difficulty: "beginner", statement: "복리의 효과는 투자 기간이 길수록 강력해진다", answer: true, explanation: "아인슈타인이 '세상에서 가장 강력한 힘'이라고 한 복리! 시간이 최고의 무기예요.", category: "philosophy" },
  { format: "ox", difficulty: "beginner", statement: "ETF는 한 번에 여러 종목에 투자할 수 있는 상품이다", answer: true, explanation: "맞아요! ETF는 여러 주식을 묶어서 하나의 상품으로 만든 거예요. 분산 투자의 쉬운 방법!", category: "basics" },
  { format: "ox", difficulty: "beginner", statement: "배당금은 주식을 팔아야만 받을 수 있다", answer: false, explanation: "배당금은 주식을 보유하고 있으면 자동으로 받을 수 있어요. 팔 필요가 없어요!", category: "basics" },
  { format: "ox", difficulty: "beginner", statement: "미국 주식 시장은 한국 시간으로 밤에 열린다", answer: true, explanation: "맞아요! 뉴욕은 한국보다 약 13-14시간 느려서, 한국 밤 11시 30분에 열려요.", category: "basics" },
  { format: "ox", difficulty: "beginner", statement: "주식 투자는 부자만 할 수 있다", answer: false, explanation: "소액으로도 시작할 수 있어요! 특히 미국 주식은 소수점 매매(fractional shares)가 가능해요.", category: "basics" },
];

// ===== INTERMEDIATE O/X =====
const oxIntermediate: OXQuestion[] = [
  { format: "ox", difficulty: "intermediate", statement: "워런 버핏은 '남들이 두려워할 때 탐욕스러워라'고 말했다", answer: true, explanation: "맞아요! 시장의 공포가 극에 달할 때가 종종 좋은 매수 기회가 됩니다.", category: "philosophy" },
  { format: "ox", difficulty: "intermediate", statement: "분산 투자는 리스크를 완전히 제거해 준다", answer: false, explanation: "분산 투자는 비체계적 위험을 줄여주지만, 시장 전체 위험(체계적 위험)은 제거할 수 없어요.", category: "basics" },
  { format: "ox", difficulty: "intermediate", statement: "PER(주가수익비율)이 낮을수록 항상 좋은 투자다", answer: false, explanation: "낮은 PER이 반드시 저평가를 의미하지 않아요. 기업의 성장성, 업종 특성도 함께 봐야 해요.", category: "basics" },
  { format: "ox", difficulty: "intermediate", statement: "매일 주가를 확인하는 것이 장기투자에 도움이 된다", answer: false, explanation: "잦은 확인은 오히려 불안과 충동적 매매를 유발해요. 분기별 체크가 더 건강합니다.", category: "psychology" },
  { format: "ox", difficulty: "intermediate", statement: "달러 코스트 에버리징(적립식 투자)은 시장 타이밍 위험을 줄여준다", answer: true, explanation: "매월 일정액을 투자하면 평균 매수 단가를 낮추고 타이밍 리스크를 분산할 수 있어요.", category: "strategy" },
  { format: "ox", difficulty: "intermediate", statement: "좋은 기업의 주식은 비쌀 때 사도 장기적으로 괜찮다", answer: true, explanation: "피터 린치: '좋은 기업은 시간이 해결해준다.' 물론 합리적 가격이면 더 좋겠죠!", category: "strategy" },
  { format: "ox", difficulty: "intermediate", statement: "주식 투자에서 감정적 결정은 대부분 좋은 결과를 가져온다", answer: false, explanation: "감정적 매매는 높을 때 사고 낮을 때 파는 패턴을 만들어요. 원칙에 기반한 투자가 중요합니다.", category: "psychology" },
  { format: "ox", difficulty: "intermediate", statement: "S&P 500 지수는 장기적으로 연평균 약 10%의 수익률을 기록해왔다", answer: true, explanation: "역사적으로 S&P 500은 배당 포함 연평균 약 10%의 수익률을 보여왔어요.", category: "basics" },
];

// ===== ADVANCED O/X =====
const oxAdvanced: OXQuestion[] = [
  { format: "ox", difficulty: "advanced", statement: "찰리 멍거는 '적게 알더라도 확실히 알아야 한다'고 말했다", answer: true, explanation: "능력의 원(Circle of Competence) — 자신이 잘 아는 영역에 집중하라는 뜻이에요.", category: "philosophy" },
  { format: "ox", difficulty: "advanced", statement: "과거 수익률이 좋은 펀드는 미래에도 좋은 성과를 낼 확률이 높다", answer: false, explanation: "과거 성과가 미래를 보장하지 않아요. 투자의 가장 기본적인 경고문이죠!", category: "basics" },
  { format: "ox", difficulty: "advanced", statement: "역사적으로 하락장에서 매도한 투자자가 반등 초기를 놓치면 장기 수익률이 크게 떨어진다", answer: true, explanation: "최고 상승일 10일을 놓치면 수익률이 절반 이하로 떨어져요. 시장에 머무는 것이 중요!", category: "strategy" },
  { format: "ox", difficulty: "advanced", statement: "자사주 매입(buyback)은 주당 순이익(EPS)을 높이는 효과가 있다", answer: true, explanation: "발행 주식수가 줄어드니까 같은 순이익이라도 주당 이익은 올라가요.", category: "basics" },
  { format: "ox", difficulty: "advanced", statement: "워런 버핏의 연평균 수익률은 약 50%이다", answer: false, explanation: "버핏의 연평균 수익률은 약 20%예요. 하지만 60년간 복리로 쌓이니 천문학적 수익이 된 거죠!", category: "philosophy" },
  { format: "ox", difficulty: "advanced", statement: "경기 침체기에 필수소비재(Consumer Staples) 섹터는 상대적으로 방어적이다", answer: true, explanation: "사람들은 경기가 나빠도 치약, 식료품은 사야 하니까요. 대표적 방어주예요.", category: "strategy" },
  { format: "ox", difficulty: "advanced", statement: "DCF(현금흐름할인법)에서 할인율이 높을수록 기업 가치가 높게 평가된다", answer: false, explanation: "할인율이 높으면 미래 현금흐름의 현재가치가 낮아져요. 즉 기업 가치가 낮게 평가됩니다.", category: "basics" },
  { format: "ox", difficulty: "advanced", statement: "마이클 버리는 2008년 서브프라임 모기지 위기를 예측했다", answer: true, explanation: "영화 '빅쇼트'의 실제 주인공! CDO와 CDS를 통해 엄청난 수익을 거뒀어요.", category: "philosophy" },
];

// ===== BEGINNER Multiple Choice =====
const mcBeginner: MultipleChoiceQuestion[] = [
  { format: "multiple_choice", difficulty: "beginner", question: "주식이란 무엇인가요?", options: ["기업의 소유권 일부", "은행에 맡기는 돈", "정부가 발행하는 채권", "부동산 투자 방법"], correctIndex: 0, explanation: "주식은 기업의 소유권 일부를 사는 것이에요. 주주가 되면 그 기업의 성장에 참여하는 거예요!", category: "basics" },
  { format: "multiple_choice", difficulty: "beginner", question: "'장기 투자'는 보통 어느 정도 기간을 말하나요?", options: ["5년 이상", "1주일", "1개월", "3개월"], correctIndex: 0, explanation: "일반적으로 장기 투자는 5년 이상을 의미해요. 복리의 마법은 시간이 필요하거든요!", category: "basics" },
  { format: "multiple_choice", difficulty: "beginner", question: "미국 주식 시장의 대표 지수가 아닌 것은?", options: ["코스피", "S&P 500", "나스닥", "다우존스"], correctIndex: 0, explanation: "코스피는 한국 주식 시장 지수예요. S&P 500, 나스닥, 다우존스가 미국 3대 지수!", category: "basics" },
  { format: "multiple_choice", difficulty: "beginner", question: "투자할 때 가장 중요한 것은?", options: ["인내심과 원칙", "운 좋게 타이밍 맞추기", "유튜버 추천 따라하기", "매일 주가 확인하기"], correctIndex: 0, explanation: "성공적인 투자의 핵심은 자신만의 원칙을 세우고 인내심을 갖는 것이에요.", category: "philosophy" },
  { format: "multiple_choice", difficulty: "beginner", question: "분산 투자란?", options: ["여러 종목에 나눠 투자하는 것", "한 종목에 몰빵하는 것", "매일 사고 파는 것", "빚을 내서 투자하는 것"], correctIndex: 0, explanation: "달걀을 한 바구니에 담지 마라! 여러 종목에 나누면 위험을 줄일 수 있어요.", category: "strategy" },
];

// ===== INTERMEDIATE Multiple Choice =====
const mcIntermediate: MultipleChoiceQuestion[] = [
  { format: "multiple_choice", difficulty: "intermediate", question: "워런 버핏의 투자 원칙 1번은?", options: ["절대 돈을 잃지 마라", "빠르게 매매하라", "레버리지를 활용하라", "유행을 따르라"], correctIndex: 0, explanation: "버핏의 원칙 1: 절대 돈을 잃지 마라. 원칙 2: 원칙 1을 절대 잊지 마라!", category: "philosophy" },
  { format: "multiple_choice", difficulty: "intermediate", question: "'경제적 해자(Economic Moat)'란?", options: ["기업의 지속적 경쟁 우위", "주가의 저항선", "정부의 규제 장벽", "CEO의 경영 능력"], correctIndex: 0, explanation: "경제적 해자는 기업이 경쟁사로부터 이익을 보호할 수 있는 지속적인 경쟁 우위를 말해요.", category: "basics" },
  { format: "multiple_choice", difficulty: "intermediate", question: "주식 시장이 폭락할 때 장기투자자가 해야 할 일은?", options: ["투자 원칙을 다시 점검한다", "모든 주식을 즉시 판다", "뉴스를 계속 확인한다", "레버리지로 공매도한다"], correctIndex: 0, explanation: "폭락 시에는 패닉 셀링을 피하고, 자신의 투자 원칙과 기업의 펀더멘털을 재점검하세요.", category: "strategy" },
  { format: "multiple_choice", difficulty: "intermediate", question: "'FOMO'는 무슨 뜻인가요?", options: ["놓칠까 봐 두려운 심리", "빠르게 수익을 내는 전략", "외국인 매도 지표", "펀드 운용 수수료"], correctIndex: 0, explanation: "Fear Of Missing Out — 기회를 놓칠까 봐 서둘러 매수하는 심리예요. 조심!", category: "psychology" },
  { format: "multiple_choice", difficulty: "intermediate", question: "피터 린치가 강조한 투자 원칙은?", options: ["자기가 아는 것에 투자하라", "남들을 따라 투자하라", "차트만 보고 투자하라", "항상 공매도도 함께하라"], correctIndex: 0, explanation: "린치는 '자기가 잘 아는 기업에 투자하라'고 강조했어요.", category: "philosophy" },
  { format: "multiple_choice", difficulty: "intermediate", question: "투자에서 '72의 법칙'이란?", options: ["72를 수익률로 나누면 원금 2배 시간", "72개 종목에 분산하라", "72시간 내에 매매를 결정하라", "72% 이상 상승하면 매도하라"], correctIndex: 0, explanation: "연 수익률 10%라면 72÷10=7.2년에 원금이 2배!", category: "basics" },
];

// ===== ADVANCED Multiple Choice =====
const mcAdvanced: MultipleChoiceQuestion[] = [
  { format: "multiple_choice", difficulty: "advanced", question: "S&P 500에서 가장 큰 비중을 차지하는 섹터는? (2024 기준)", options: ["IT(정보기술)", "헬스케어", "금융", "에너지"], correctIndex: 0, explanation: "IT 섹터가 약 30% 이상의 비중을 차지하고 있어요.", category: "basics" },
  { format: "multiple_choice", difficulty: "advanced", question: "주식 투자에서 '앵커링 효과'란?", options: ["처음 접한 가격에 집착하는 심리", "항구에서 주식을 사는 전략", "안전한 채권에 투자하는 방법", "자동 매매 시스템"], correctIndex: 0, explanation: "매수 가격에 집착해서 이성적 판단을 못하는 심리편향이에요.", category: "psychology" },
  { format: "multiple_choice", difficulty: "advanced", question: "FCF(잉여현금흐름)가 중요한 이유는?", options: ["기업이 실제로 쓸 수 있는 현금을 보여줘서", "주가가 올라갈 것을 보장해서", "세금을 면제받을 수 있어서", "배당을 의무화하기 때문에"], correctIndex: 0, explanation: "FCF는 기업이 운영과 투자 후 남는 실제 현금이에요. 기업의 재무 건전성을 판단하는 핵심 지표!", category: "basics" },
  { format: "multiple_choice", difficulty: "advanced", question: "하워드 막스가 말하는 '2차적 사고'란?", options: ["남들의 생각을 고려한 역발상 투자", "두 번 생각하고 매수하는 것", "2차 시장에서 거래하는 것", "두 번째로 좋은 종목을 사는 것"], correctIndex: 0, explanation: "'이 주식이 좋다'가 아니라 '남들은 어떻게 생각하고, 그것이 가격에 반영됐는가'를 생각하는 거예요.", category: "philosophy" },
  { format: "multiple_choice", difficulty: "advanced", question: "주가 대비 잉여현금흐름(P/FCF) 비율이 낮으면?", options: ["상대적으로 저평가 가능성", "무조건 좋은 투자", "기업이 위험하다는 신호", "배당이 높다는 의미"], correctIndex: 0, explanation: "P/FCF가 낮으면 현금 창출 능력 대비 주가가 싸다는 뜻이에요. 하지만 다른 지표와 함께 봐야 해요.", category: "basics" },
];

// ===== BEGINNER Fill Blank =====
const fbBeginner: FillBlankQuestion[] = [
  { format: "fill_blank", difficulty: "beginner", sentence: "투자에서 가장 강력한 무기는 ___이다", answer: "시간", hints: ["기간", "시간"], explanation: "복리 효과는 시간이 지날수록 기하급수적으로 커져요. 인내심이 곧 수익!", category: "philosophy" },
  { format: "fill_blank", difficulty: "beginner", sentence: "달걀을 한 ___에 담지 마라", answer: "바구니", hints: ["바구니", "그릇"], explanation: "분산 투자의 가장 유명한 격언이에요! 여러 종목에 나누어 투자하세요.", category: "strategy" },
  { format: "fill_blank", difficulty: "beginner", sentence: "주식을 사면 그 기업의 ___가 되는 것이다", answer: "주주", hints: ["주주", "주인"], explanation: "주식을 산다는 건 기업의 일부를 소유하는 거예요. 기업의 성장에 함께 참여하는 것!", category: "basics" },
  { format: "fill_blank", difficulty: "beginner", sentence: "미국 대형 500개 기업을 모아놓은 대표 지수는 S&P ___이다", answer: "500", hints: ["500"], explanation: "S&P 500은 미국 주식 시장을 대표하는 가장 유명한 지수예요!", category: "basics" },
  { format: "fill_blank", difficulty: "beginner", sentence: "매달 같은 금액을 투자하는 전략을 ___식 투자라고 한다", answer: "적립", hints: ["적립", "정기"], explanation: "적립식 투자(DCA)는 시장 타이밍을 맞추지 않아도 되는 좋은 전략이에요!", category: "strategy" },
];

// ===== INTERMEDIATE Fill Blank =====
const fbIntermediate: FillBlankQuestion[] = [
  { format: "fill_blank", difficulty: "intermediate", sentence: "워런 버핏: '남들이 탐욕스러울 때 ___, 남들이 두려워할 때 탐욕스러워라'", answer: "두려워하고", hints: ["두려워", "공포"], explanation: "시장의 극단적 감정과 반대로 행동하라는 역발상 투자의 핵심!", category: "philosophy" },
  { format: "fill_blank", difficulty: "intermediate", sentence: "찰리 멍거: '좋은 기업을 적정한 가격에 사는 것이 평범한 기업을 ___ 가격에 사는 것보다 낫다'", answer: "싼", hints: ["저렴한", "싼"], explanation: "가치투자의 핵심! 싸다고 좋은 게 아니라, 좋은 기업이 중요해요.", category: "philosophy" },
  { format: "fill_blank", difficulty: "intermediate", sentence: "투자의 가장 큰 적은 시장이 아니라 자기 자신의 ___이다", answer: "감정", hints: ["마음", "감정"], explanation: "벤자민 그레이엄의 명언이에요. 공포와 탐욕을 다스리는 것이 투자의 핵심!", category: "psychology" },
  { format: "fill_blank", difficulty: "intermediate", sentence: "72의 법칙: 72를 연간 수익률로 나누면 원금이 ___배가 되는 시간을 알 수 있다", answer: "2", hints: ["두", "2"], explanation: "연 수익률 8%라면 72÷8=9년이면 원금이 2배!", category: "basics" },
  { format: "fill_blank", difficulty: "intermediate", sentence: "경제적 ___란 기업이 경쟁사로부터 이익을 보호하는 지속적인 경쟁 우위를 말한다", answer: "해자", hints: ["해자", "moat"], explanation: "버핏이 즐겨 사용하는 개념으로, 브랜드, 네트워크 효과, 특허 등이 해당돼요.", category: "basics" },
  { format: "fill_blank", difficulty: "intermediate", sentence: "존 보글: '건초 더미에서 바늘을 찾지 말고, 건초 더미 ___를 사라'", answer: "전체", hints: ["전체", "전부"], explanation: "인덱스 펀드의 아버지 보글의 철학! 시장 전체를 사면 승자를 고를 필요가 없어요.", category: "philosophy" },
];

// ===== ADVANCED Fill Blank =====
const fbAdvanced: FillBlankQuestion[] = [
  { format: "fill_blank", difficulty: "advanced", sentence: "피터 린치: '주식 시장에서 돈을 잃는 것보다 ___ 준비하다가 잃는 돈이 더 많다'", answer: "조정에", hints: ["조정", "하락"], explanation: "폭락을 기다리며 투자하지 않는 것도 기회비용이에요.", category: "strategy" },
  { format: "fill_blank", difficulty: "advanced", sentence: "하워드 막스: '투자에서 가장 위험한 여섯 글자는 ___가 없다는 것이다'", answer: "리스크", hints: ["리스크", "위험"], explanation: "리스크가 없다고 느낄 때가 가장 위험해요. 과도한 낙관은 버블의 신호!", category: "psychology" },
  { format: "fill_blank", difficulty: "advanced", sentence: "벤저민 그레이엄은 단기적으로 시장은 투표 기계이지만, 장기적으로는 ___ 기계라고 했다", answer: "저울", hints: ["저울", "체중계"], explanation: "단기에는 인기투표(감정)에 의해 움직이지만, 장기에는 기업의 실제 가치를 반영해요.", category: "philosophy" },
  { format: "fill_blank", difficulty: "advanced", sentence: "레이 달리오의 '올웨더 포트폴리오'는 모든 ___에 대응할 수 있도록 설계됐다", answer: "경제 환경", hints: ["경제", "시장"], explanation: "인플레이션, 디플레이션, 성장, 침체 — 어떤 경제 환경에서도 안정적인 포트폴리오!", category: "strategy" },
  { format: "fill_blank", difficulty: "advanced", sentence: "ROIC(투하자본수익률)이 ___보다 높은 기업은 가치를 창출하고 있다", answer: "WACC", hints: ["가중평균자본비용", "WACC"], explanation: "ROIC > WACC이면 기업이 투자한 자본 대비 더 많은 수익을 내고 있다는 뜻이에요.", category: "basics" },
];

// Combine all questions
export const allQuestions: QuizQuestion[] = [
  ...oxBeginner, ...oxIntermediate, ...oxAdvanced,
  ...mcBeginner, ...mcIntermediate, ...mcAdvanced,
  ...fbBeginner, ...fbIntermediate, ...fbAdvanced,
];

// Map user level (1-6) to difficulty
function getDifficultyForLevel(level: number): Difficulty[] {
  if (level <= 2) return ["beginner"];
  if (level <= 4) return ["beginner", "intermediate"];
  return ["intermediate", "advanced"];
}

// Get quiz set based on user level
export function getDailyQuizSet(count: number, userLevel: number = 1): QuizQuestion[] {
  const difficulties = getDifficultyForLevel(userLevel);
  const formats: Array<"ox" | "multiple_choice" | "fill_blank"> = [
    "multiple_choice", "ox", "fill_blank",
  ];

  const result: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const format = formats[i % formats.length];
    const pool = allQuestions.filter(
      (q) => q.format === format && difficulties.includes(q.difficulty)
    );

    // Avoid duplicates
    const unused = pool.filter(
      (q) => !result.some((r) => JSON.stringify(r) === JSON.stringify(q))
    );

    const pick = unused.length > 0 ? unused : pool;
    if (pick.length > 0) {
      result.push(pick[Math.floor(Math.random() * pick.length)]);
    }
  }

  return result;
}

// Get a random question
export function getRandomQuiz(): QuizQuestion {
  return allQuestions[Math.floor(Math.random() * allQuestions.length)];
}
