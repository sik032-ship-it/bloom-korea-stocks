// 사고방식 훈련형 투자 퀴즈
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
  insight?: string;
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

// 카테고리 메타 (icon은 Lucide icon name)
export const categoryLabels: Record<QuizCategory, { name: string; icon: string; color: string }> = {
  risk: { name: "위험 이해", icon: "crosshair", color: "#EF4444" },
  psychology: { name: "심리 조절", icon: "brain", color: "#8B5CF6" },
  crisis: { name: "위기 대처", icon: "shield", color: "#F59E0B" },
  judgment: { name: "판단력", icon: "scale", color: "#3B82F6" },
};

// ===== 위험 이해 (Risk) =====
const riskQuestions: QuizQuestion[] = [
  // --- existing ---
  { format: "ox", difficulty: "beginner", category: "risk", statement: "투자에서 리스크가 없다는 말을 들으면 안심해도 된다", answer: false, explanation: "하워드 막스: '투자에서 가장 위험한 것은 리스크가 없다는 믿음이다.' 리스크가 보이지 않을 때가 가장 위험해요.", insight: "리스크를 느끼지 못하는 순간이 가장 위험합니다. 이 감각을 키우는 것이 투자의 시작이에요." },
  { format: "ox", difficulty: "beginner", category: "risk", statement: "분산 투자를 하면 모든 리스크가 사라진다", answer: false, explanation: "분산 투자는 개별 종목 리스크를 줄여주지만, 시장 전체 리스크(체계적 위험)는 제거할 수 없어요.", insight: "리스크는 제거하는 것이 아니라 이해하고 관리하는 것입니다." },
  { format: "ox", difficulty: "beginner", category: "risk", statement: "과거에 많이 오른 주식은 앞으로도 계속 오를 확률이 높다", answer: false, explanation: "과거 성과는 미래를 보장하지 않아요. 이것은 투자의 가장 기본적인 경고문이에요.", insight: "과거 데이터에 의존하는 것은 '백미러를 보며 운전하는 것'과 같아요." },
  { format: "ox", difficulty: "intermediate", category: "risk", statement: "변동성이 큰 주식은 항상 위험한 투자다", answer: false, explanation: "변동성과 리스크는 다릅니다. 변동성은 가격의 흔들림이고, 진짜 리스크는 영구적 자본 손실이에요.", insight: "변동성을 두려워하면 기회를 놓치고, 리스크를 무시하면 자본을 잃어요. 둘을 구분하는 눈이 필요합니다." },
  { format: "ox", difficulty: "intermediate", category: "risk", statement: "레버리지(빚투)를 사용하면 수익이 2배가 되니까 항상 유리하다", answer: false, explanation: "레버리지는 이익도 2배지만 손실도 2배예요. 시장이 50% 떨어지면 원금 전부를 잃을 수 있어요.", insight: "살아남아야 이길 수 있어요. 레버리지는 생존 확률을 낮추는 가장 확실한 방법입니다." },
  { format: "ox", difficulty: "advanced", category: "risk", statement: "블랙 스완(극단적 사건)은 예측할 수 없기 때문에 대비할 필요가 없다", answer: false, explanation: "나심 탈레브: '예측할 수 없는 사건에 대비하는 것이 핵심이다.' 대비가 곧 생존입니다.", insight: "좋은 투자자는 미래를 예측하지 않습니다. 어떤 미래가 와도 살아남을 수 있도록 준비합니다." },
  { format: "multiple_choice", difficulty: "beginner", category: "risk", question: "투자에서 '리스크'의 진짜 의미는?", options: ["영구적으로 돈을 잃을 가능성", "주가가 오르내리는 것", "뉴스에 나쁜 소식이 나오는 것", "환율이 변하는 것"], correctIndex: 0, explanation: "변동성은 리스크가 아니에요. 진짜 리스크는 투자한 돈을 영구적으로 잃는 것입니다.", insight: "이 구분을 아는 것만으로도 공포에 팔고 탐욕에 사는 실수를 크게 줄일 수 있어요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "risk", question: "당신이 투자한 주식이 30% 떨어졌습니다. 가장 먼저 해야 할 것은?", options: ["기업의 기본 가치가 변했는지 확인한다", "즉시 손절한다", "물타기로 더 산다", "뉴스를 보고 따라한다"], correctIndex: 0, explanation: "가격이 떨어졌다는 사실보다 '왜' 떨어졌는지가 중요해요. 기업 가치가 변하지 않았다면 오히려 기회일 수 있어요.", insight: "감정이 아닌 '이유'에 집중하는 습관이 위기에서 살아남는 핵심이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "나심 탈레브의 '안티프래질' 개념에 가장 가까운 것은?", options: ["충격을 받을수록 더 강해지는 시스템", "절대 깨지지 않는 방어", "모든 리스크를 완전히 제거하는 것", "변동성이 없는 안정적인 포트폴리오"], correctIndex: 0, explanation: "안티프래질은 단순히 튼튼한 게 아니라, 혼란과 충격에서 오히려 이익을 얻는 상태예요.", insight: "위기를 피하려고만 하지 마세요. 위기에서 성장하는 구조를 만드는 것이 진짜 실력이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "risk", sentence: "투자의 첫 번째 규칙: '절대 ___을 잃지 마라'", answer: "돈", hints: ["원금", "돈"], explanation: "워런 버핏의 가장 유명한 규칙. 규칙 2: '규칙 1을 절대 잊지 마라.'", insight: "수익을 추구하기 전에 원금을 지키는 것이 먼저입니다. 생존이 곧 승리예요." },
  { format: "fill_blank", difficulty: "intermediate", category: "risk", sentence: "하워드 막스: '투자에서 가장 위험한 것은 ___가 없다는 믿음이다'", answer: "리스크", hints: ["리스크", "위험"], explanation: "모두가 안전하다고 느낄 때 자산 가격은 위험 수준까지 올라가 있어요.", insight: "시장이 가장 안전해 보일 때 가장 조심해야 합니다. 이것이 역발상의 핵심이에요." },

  // --- NEW advanced 10 ---
  { format: "ox", difficulty: "advanced", category: "risk", statement: "꼬리 리스크(tail risk)는 발생 확률이 낮으므로 무시해도 된다", answer: false, explanation: "LTCM(1998)은 꼬리 리스크를 무시해 46억 달러를 잃었어요. 희귀한 사건이 파멸을 부릅니다.", insight: "확률이 낮다고 무시하면, 그 한 번이 모든 것을 날릴 수 있어요." },
  { format: "ox", difficulty: "advanced", category: "risk", statement: "켈리 기준(Kelly Criterion)에 따르면 확률이 유리해도 올인은 최적 전략이 아니다", answer: true, explanation: "켈리 공식은 항상 전체 자본의 일부만 베팅하라고 합니다. 올인은 수학적으로도 최악이에요.", insight: "유리한 게임에서도 베팅 크기가 생존을 결정합니다. 크기 조절이 곧 리스크 관리예요." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "포트폴리오의 최대 낙폭(MDD)이 중요한 이유는?", options: ["-50% 하락 후 원금 회복에 +100% 상승이 필요하기 때문", "MDD가 클수록 수익률도 높기 때문", "세금 계산에 필요하기 때문", "펀드매니저 평가에만 쓰이기 때문"], correctIndex: 0, explanation: "하락의 수학은 비대칭이에요. 50% 잃으면 100% 벌어야 원금이에요.", insight: "큰 손실을 피하는 것이 큰 수익을 내는 것보다 수학적으로 더 중요합니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "상관관계가 낮은 자산을 섞으면 어떤 효과가 있나요?", options: ["같은 수익에 더 낮은 변동성 달성 가능", "수익률이 2배로 증가", "모든 위험이 사라짐", "세금이 줄어듦"], correctIndex: 0, explanation: "마코위츠의 현대 포트폴리오 이론 핵심이에요. 분산의 효과는 상관관계에서 옵니다.", insight: "분산 투자의 진짜 힘은 '많이 사는 것'이 아니라 '다르게 움직이는 것'을 사는 데 있어요." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "2008년 금융위기에서 CDO(부채담보부증권)의 핵심 문제는?", options: ["복잡한 구조로 실제 리스크가 은폐됐다", "수익률이 너무 낮았다", "유동성이 너무 높았다", "정부가 규제를 너무 많이 했다"], correctIndex: 0, explanation: "복잡한 금융상품일수록 리스크가 숨어있을 확률이 높아요. 이해 못하면 투자하지 마세요.", insight: "이해하지 못하는 것에 투자하는 순간, 당신은 도박을 하고 있는 겁니다." },
  { format: "fill_blank", difficulty: "advanced", category: "risk", sentence: "나심 탈레브: '예측할 수 없는 것에 대비하라. 이것이 진정한 ___이다'", answer: "리스크 관리", hints: ["리스크 관리", "위험 관리"], explanation: "예측 가능한 리스크는 이미 가격에 반영돼 있어요. 진짜 관리는 미지의 위험에 대비하는 것.", insight: "알려진 위험보다 모르는 위험이 더 무섭습니다. 대비의 본질이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "risk", sentence: "LTCM 사태의 교훈: 아무리 뛰어난 모델도 ___ 앞에서는 무력하다", answer: "시장", hints: ["시장", "현실"], explanation: "노벨상 수상자들이 만든 헤지펀드도 시장의 비합리성 앞에 무너졌어요.", insight: "모델은 현실의 근사치일 뿐이에요. 현실을 모델에 맞추려 하면 파멸합니다." },
  { format: "ox", difficulty: "advanced", category: "risk", statement: "VIX(공포지수)가 낮을 때가 시장에 진입하기 가장 안전한 시기다", answer: false, explanation: "VIX가 극단적으로 낮을 때 오히려 자만심이 극에 달해 있는 경우가 많아요. 2007년 말 VIX는 매우 낮았습니다.", insight: "안전해 보이는 순간이 가장 위험할 수 있어요. 역설적이지만 이것이 시장의 본질이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "에르고딕성(ergodicity)이 투자에서 중요한 이유는?", options: ["개인의 시간 평균과 앙상블 평균이 다르기 때문", "분산투자가 불필요하기 때문", "수익률 계산이 쉬워지기 때문", "세금 최적화에 도움되기 때문"], correctIndex: 0, explanation: "100명 중 99명이 이기는 게임이라도, 한 번 파산하면 그 개인에게는 끝이에요.", insight: "통계적으로 유리해도 '파산 가능성'이 있으면 플레이하면 안 됩니다." },
  { format: "ox", difficulty: "advanced", category: "risk", statement: "리스크 패리티 전략은 모든 자산에 동일 금액을 투자하는 것이다", answer: false, explanation: "리스크 패리티는 금액이 아닌 '위험 기여도'를 균등하게 배분하는 전략이에요.", insight: "같은 금액을 넣어도 위험은 같지 않아요. 위험의 크기로 생각하는 것이 진짜 분산이에요." },
];

// ===== 심리 조절 (Psychology) =====
const psychologyQuestions: QuizQuestion[] = [
  // --- existing ---
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "주식이 떨어질 때 불안한 마음은 비정상적인 반응이다", answer: false, explanation: "손실 회피 본능은 인간의 자연스러운 심리예요. 문제는 이 감정에 '반응'하는 것이에요.", insight: "감정을 느끼는 것은 자연스러워요. 중요한 건 감정이 아니라, 감정에 대한 '행동'이에요." },
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "뉴스에서 '공포'라는 단어가 많이 나올 때는 주식을 무조건 팔아야 한다", answer: false, explanation: "워런 버핏: '남들이 두려워할 때 탐욕스러워라.' 미디어의 공포는 종종 좋은 매수 기회의 신호예요.", insight: "미디어는 감정을 증폭시킵니다. 뉴스를 읽되, 뉴스에 휘둘리지 않는 능력이 필요해요." },
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "매일 주가를 확인하는 것이 장기 투자에 도움이 된다", answer: false, explanation: "잦은 확인은 불안과 충동적 매매를 유발해요. 분기별 체크가 더 건강합니다.", insight: "확인 빈도를 줄이면 감정적 결정도 줄어요. 좋은 투자는 '지루한' 투자예요." },
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "손실이 난 주식을 팔기 싫은 것은 합리적인 판단이다", answer: false, explanation: "이것은 '처분 효과'라는 심리 편향이에요. 이익은 빨리 실현하고 손실은 오래 끌어안는 경향.", insight: "팔기 싫은 감정과 팔면 안 되는 이유는 다릅니다. 감정과 분석을 구분하는 연습이 필요해요." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "자신의 투자 판단에 확신이 강할수록 좋은 투자자다", answer: false, explanation: "과잉 확신은 가장 위험한 편향 중 하나예요. 좋은 투자자는 항상 '내가 틀릴 수 있다'고 생각해요.", insight: "확신이 아니라 겸손함이 생존의 열쇠입니다. '내가 모르는 것이 뭘까?'를 항상 물어보세요." },
  { format: "multiple_choice", difficulty: "beginner", category: "psychology", question: "친구들이 모두 특정 주식을 사서 큰 수익을 냈다고 합니다. 당신의 반응은?", options: ["내 투자 원칙에 맞는지 먼저 분석한다", "나도 빨리 따라 산다", "이미 늦었으니 더 많이 산다", "SNS에서 추천 종목을 더 찾아본다"], correctIndex: 0, explanation: "FOMO(놓칠까 봐 두려운 심리)는 가장 흔한 투자 실수의 원인이에요. 원칙이 감정을 이겨야 해요.", insight: "남들이 돈을 벌었다는 소식은 '정보'가 아니라 '감정 자극'이에요. 구분할 줄 알아야 해요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "'앵커링 효과'에 빠진 투자자의 행동은?", options: ["매수 가격에 집착해서 합리적 판단을 못한다", "항상 최저가에 매수한다", "뉴스에 영향받지 않는다", "여러 종목에 골고루 투자한다"], correctIndex: 0, explanation: "내가 산 가격은 시장에게 아무 의미 없어요. 중요한 건 '지금 이 기업의 가치가 어떤가'예요.", insight: "매수 가격을 잊으세요. 지금 이 가격에 다시 살 것인지를 물어보는 것이 올바른 질문이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "다니엘 카너먼에 따르면, 인간은 같은 크기의 이익보다 손실을 약 몇 배 더 크게 느끼나요?", options: ["약 2~2.5배", "약 1.2배", "약 5배", "동일하게 느낀다"], correctIndex: 0, explanation: "10만원 벌 때의 기쁨보다 10만원 잃을 때의 고통이 2배 이상 커요. 이게 '손실 회피'의 핵심.", insight: "이 비대칭을 이해하면 왜 대부분의 사람이 하락장에서 패닉 매도하는지 알 수 있어요." },
  { format: "fill_blank", difficulty: "beginner", category: "psychology", sentence: "벤자민 그레이엄: '투자의 가장 큰 적은 시장이 아니라 자기 자신의 ___이다'", answer: "감정", hints: ["마음", "감정"], explanation: "공포와 탐욕을 다스리는 것이 투자의 핵심이에요.", insight: "시장을 이기려 하지 마세요. 자신의 감정을 이기면 시장은 알아서 보상해줘요." },
  { format: "fill_blank", difficulty: "intermediate", category: "psychology", sentence: "워런 버핏: '남들이 탐욕스러울 때 ___, 남들이 두려워할 때 탐욕스러워라'", answer: "두려워하고", hints: ["두려워", "공포"], explanation: "시장의 극단적 감정과 반대로 행동하라는 역발상 투자의 핵심!", insight: "군중과 반대로 움직이는 것은 쉽지 않아요. 하지만 그래서 소수만 성공하는 거예요." },

  // --- NEW advanced 10 ---
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "성공적인 트레이드 직후에는 판단력이 더 좋아진다", answer: false, explanation: "성공 후 '하우스 머니 효과'로 위험을 과소평가하게 돼요. 연승 후가 가장 위험한 순간이에요.", insight: "이겼을 때 더 조심하세요. 승리의 도취가 다음 패배를 부릅니다." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "투자 일지를 쓰는 것은 심리 편향을 줄이는 데 효과적이다", answer: true, explanation: "결정 시점의 이유를 기록하면 사후 합리화(hindsight bias)를 방지할 수 있어요.", insight: "기록은 자기 자신에게 정직해지는 가장 강력한 도구예요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "당신의 포트폴리오가 한 달째 시장 대비 10% 언더퍼폼 중입니다. 어떤 반응이 위험할까요?", options: ["전략을 갈아엎고 최근 상승 종목으로 교체한다", "원래 투자 논거가 여전히 유효한지 점검한다", "아무것도 하지 않고 더 지켜본다", "투자 일지에 감정과 분석을 기록한다"], correctIndex: 0, explanation: "최근 성과를 쫓는 것은 '성과 추종 편향'이에요. 항상 늦게 들어가 비싸게 사게 됩니다.", insight: "좋은 전략은 한 달 만에 판단할 수 없어요. 인내심이 곧 경쟁력이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "'더닝-크루거 효과'가 투자에서 위험한 이유는?", options: ["초보일수록 자신의 실력을 과대평가하기 때문", "전문가만 투자해야 하기 때문", "지식이 많을수록 불안해지기 때문", "모든 사람이 동일한 편향을 가지기 때문"], correctIndex: 0, explanation: "약간의 지식은 '나는 안다'는 착각을 줘요. 진짜 지혜는 '내가 모르는 것이 얼마나 많은지'를 아는 것.", insight: "겸손하게 배우는 초보가 자만하는 중급자보다 더 안전합니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "사후 확증 편향(hindsight bias)의 실제 예는?", options: ["'나는 그때 떨어질 줄 알았어'라고 생각하는 것", "매수 전에 충분히 분석하는 것", "손절 라인을 미리 정하는 것", "포트폴리오를 분기마다 점검하는 것"], correctIndex: 0, explanation: "결과를 본 후 '나는 알았다'고 기억을 왜곡하면, 같은 실수를 반복해요.", insight: "과거를 정확히 기억하는 것이 미래를 대비하는 첫 걸음이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "psychology", sentence: "행동경제학에서 '현상 유지 ___'은 변화를 거부하는 인간의 본능이다", answer: "편향", hints: ["편향", "바이어스"], explanation: "현상 유지 편향 때문에 손실 종목을 계속 들고 있거나 리밸런싱을 미루게 돼요.", insight: "'그냥 두자'라는 생각이 정말 분석의 결론인지, 귀찮음인지 구분하세요." },
  { format: "fill_blank", difficulty: "advanced", category: "psychology", sentence: "조지 소로스: '중요한 것은 옳고 그름이 아니라, 옳을 때 얼마나 ___ 그르를 때 얼마나 적게 잃느냐다'", answer: "많이 버느냐", hints: ["많이 버느냐", "많이 벌고"], explanation: "승률보다 손익비가 더 중요해요. 51%만 맞아도 이길 수 있고, 90% 맞아도 질 수 있어요.", insight: "한 번의 큰 실수가 열 번의 작은 성공을 지웁니다. 크기 관리가 핵심이에요." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "군중심리에 반대로 행동하면 항상 돈을 번다", answer: false, explanation: "역발상이 항상 맞는 것은 아니에요. 때로는 군중이 옳아요. 핵심은 '왜' 군중이 이렇게 움직이는지를 이해하는 것.", insight: "맹목적 역발상도 맹목적 추종만큼 위험해요. 분석이 먼저예요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "정보 과부하 시대에 투자자가 가져야 할 핵심 능력은?", options: ["노이즈와 시그널을 구분하는 능력", "가능한 많은 정보를 수집하는 능력", "AI가 추천하는 종목을 따르는 능력", "실시간 뉴스를 가장 먼저 보는 능력"], correctIndex: 0, explanation: "정보가 많을수록 혼란도 커져요. 핵심 신호를 가려내는 필터링 능력이 경쟁력이에요.", insight: "더 많이 아는 것보다 덜 중요한 것을 무시하는 능력이 더 가치 있어요." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "감정을 완전히 제거하면 최고의 투자자가 될 수 있다", answer: false, explanation: "신경과학 연구에 따르면, 감정이 완전히 없는 사람은 오히려 결정을 내리지 못해요. 감정을 '관리'하는 것이 목표예요.", insight: "감정은 적이 아니라 신호예요. 감정을 읽되 감정대로 행동하지 않는 것이 기술이에요." },
];

// ===== 위기 대처 (Crisis) =====
const crisisQuestions: QuizQuestion[] = [
  // --- existing ---
  { format: "ox", difficulty: "beginner", category: "crisis", statement: "주식 시장은 역사상 모든 대폭락에서 결국 회복했다", answer: true, explanation: "대공황, 닷컴 버블, 2008 금융위기, 코로나... 시장은 항상 돌아왔어요. 문제는 '당신이 버틸 수 있는가'예요.", insight: "시장은 회복합니다. 하지만 패닉에 팔고 나간 사람은 회복을 경험하지 못해요." },
  { format: "ox", difficulty: "beginner", category: "crisis", statement: "폭락장에서 가장 좋은 전략은 뉴스를 끄고 아무것도 안 하는 것이다", answer: true, explanation: "대부분의 경우, 폭락장에서 '아무것도 안 하는 것'이 패닉 매도보다 훨씬 나은 결과를 가져와요.", insight: "행동하지 않는 것도 전략입니다. 때로는 '아무것도 안 하는 용기'가 가장 어려워요." },
  { format: "ox", difficulty: "intermediate", category: "crisis", statement: "2008년 금융위기 때 S&P 500에서 버틴 투자자는 3년 안에 원금을 회복했다", answer: true, explanation: "2009년 3월 바닥 이후 S&P 500은 약 2년 만에 위기 전 수준을 회복했어요.", insight: "역사는 '버틴 사람이 이긴다'는 것을 반복적으로 증명하고 있어요." },
  { format: "ox", difficulty: "advanced", category: "crisis", statement: "최고 상승일 10일을 놓치면 장기 수익률이 절반 이하로 떨어진다", answer: true, explanation: "최대 상승일은 대부분 최대 하락일 직후에 발생해요. 시장을 떠나면 반등도 놓쳐요.", insight: "시장 타이밍을 맞추려는 시도가 가장 비싼 실수예요. 시장에 '머무는 것'이 핵심이에요." },
  { format: "multiple_choice", difficulty: "beginner", category: "crisis", question: "시장이 하루 만에 10% 폭락했습니다. 당신의 선택은?", options: ["아무것도 하지 않고 원래 계획을 유지한다", "전부 매도해서 현금화한다", "레버리지로 더 산다", "친구에게 물어보고 따라한다"], correctIndex: 0, explanation: "폭락 직후의 결정은 거의 항상 감정적이에요. 미리 세운 계획을 따르는 것이 최선입니다.", insight: "위기는 '준비된 사람'과 '즉흥적인 사람'을 가려내요. 계획은 폭풍이 오기 전에 세우는 것." },
  { format: "multiple_choice", difficulty: "intermediate", category: "crisis", question: "2020년 코로나 폭락 때 워런 버핏의 행동은?", options: ["항공주를 매도하고 현금을 비축했다", "패닉에 모든 주식을 팔았다", "레버리지로 대규모 매수했다", "주식 시장에서 완전히 은퇴했다"], correctIndex: 0, explanation: "버핏은 산업 전망이 변한 항공주를 정리했지만, 다른 좋은 기업은 유지했어요. 선택적 판단이 핵심!", insight: "위기에서도 냉정한 분석이 가능해야 해요. '전부 팔기'나 '전부 사기'는 감정적 반응이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "레이 달리오가 경제 위기에 대비하는 핵심 원칙은?", options: ["어떤 경제 환경에서도 작동하는 포트폴리오를 구성한다", "위기 직전에 모든 주식을 매도한다", "금에만 투자한다", "현금을 100% 보유한다"], correctIndex: 0, explanation: "올웨더 포트폴리오: 인플레이션, 디플레이션, 성장, 침체 어떤 환경에서도 안정적으로 작동하도록 설계.", insight: "미래를 예측하려 하지 말고, 어떤 미래가 와도 괜찮은 구조를 만드세요." },
  { format: "fill_blank", difficulty: "beginner", category: "crisis", sentence: "주식 시장 격언: 'Time in the market beats timing ___'", answer: "the market", hints: ["the market", "시장"], explanation: "시장에 머무는 시간이 시장 타이밍을 맞추려는 시도보다 항상 이겨요.", insight: "매일의 등락에 반응하지 마세요. 시간이 당신의 가장 큰 무기예요." },
  { format: "fill_blank", difficulty: "intermediate", category: "crisis", sentence: "피터 린치: '폭락에 대비하느라 잃는 돈이 폭락 ___에서 잃는 돈보다 더 많다'", answer: "자체", hints: ["자체", "그 자체"], explanation: "폭락을 기다리며 투자하지 않는 것도 기회비용이에요.", insight: "완벽한 타이밍을 기다리다가 시간을 낭비하지 마세요. 시장 참여가 가장 중요해요." },

  // --- NEW advanced 10 ---
  { format: "ox", difficulty: "advanced", category: "crisis", statement: "금리 인상기에는 모든 주식이 떨어지므로 현금만 보유해야 한다", answer: false, explanation: "2022년 급격한 금리 인상기에도 에너지, 헬스케어 등 일부 섹터는 상승했어요. 일괄 대응은 위험합니다.", insight: "위기에도 기회는 있어요. 핵심은 '어디에 기회가 있는가'를 찾는 냉정함이에요." },
  { format: "ox", difficulty: "advanced", category: "crisis", statement: "인플레이션이 높을 때 채권은 항상 안전자산이다", answer: false, explanation: "2022년 인플레이션기에 미국 채권 시장은 역사적 최악의 손실을 기록했어요. 안전자산도 환경에 따라 위험해요.", insight: "'안전자산'이라는 라벨을 맹신하지 마세요. 모든 것은 맥락에 따라 달라요." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "개별 종목이 실적 발표 후 하루 만에 -25% 급락했습니다. 첫 번째로 확인해야 할 것은?", options: ["하락이 일시적 실적 miss인지, 구조적 비즈니스 변화인지 구분한다", "즉시 물타기한다", "공매도 세력 때문이니 기다린다", "애널리스트 목표가를 확인한다"], correctIndex: 0, explanation: "메타(2022)는 -25% 후 곧 회복했지만, GE는 수년간 하락했어요. 하락의 '본질'이 다릅니다.", insight: "같은 -25%라도 '왜'가 완전히 다를 수 있어요. 원인 분석 없이 행동하지 마세요." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "스태그플레이션(경기 침체 + 인플레이션) 시기에 가장 취약한 자산은?", options: ["고성장 무배당 기술주", "실물 자산(금, 원자재)", "배당 귀족주", "단기 국채"], correctIndex: 0, explanation: "금리 상승 + 경기 둔화는 미래 성장에 의존하는 고성장주에 가장 타격이 커요.", insight: "경제 환경이 바뀌면 '지금까지 잘 된 것'이 '앞으로 가장 위험한 것'이 될 수 있어요." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "1970년대 오일쇼크에서 살아남은 투자자의 공통점은?", options: ["실물 자산 비중을 유지하고 현금 흐름에 집중했다", "기술주에 올인했다", "레버리지를 극대화했다", "주식을 전부 팔고 부동산에 투자했다"], correctIndex: 0, explanation: "인플레이션 시대에는 현금 흐름이 있는 자산과 실물 가치가 중요해져요.", insight: "시대의 패러다임이 바뀔 때 과거 전략을 고수하면 큰 손실을 봐요." },
  { format: "fill_blank", difficulty: "advanced", category: "crisis", sentence: "2008년 금융위기에서 JPMorgan 제이미 다이먼이 강조한 것: '___은 위기 때 사치품이 아니라 무기다'", answer: "현금", hints: ["현금", "유동성"], explanation: "현금이 있어야 위기 때 폭락한 우량주를 살 수 있어요. 현금은 기회의 무기예요.", insight: "현금은 '아무것도 안 하는 것'이 아니라 '기회를 기다리는 것'이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "crisis", sentence: "레이 달리오: '모든 위기에는 ___이 있다. 그것을 이해하면 대비할 수 있다'", answer: "패턴", hints: ["패턴", "반복"], explanation: "경제 사이클은 반복돼요. 부채 → 버블 → 폭락 → 구조조정 → 회복. 패턴을 알면 두렵지 않아요.", insight: "역사를 공부하는 투자자는 위기에서 덜 놀라요. 이미 '본 적 있는' 상황이니까요." },
  { format: "ox", difficulty: "advanced", category: "crisis", statement: "연준이 금리를 인하하기 시작하면 곧바로 주식을 사야 한다", answer: false, explanation: "2007-2008년 연준은 금리를 계속 낮췄지만 시장은 계속 하락했어요. 금리 인하가 바닥을 의미하지 않아요.", insight: "단일 신호에 의존하지 마세요. 여러 지표를 종합적으로 보는 것이 현명해요." },
  { format: "ox", difficulty: "advanced", category: "crisis", statement: "위기에서 가장 먼저 해야 할 것은 자신의 생존 자금(비상금)을 확인하는 것이다", answer: true, explanation: "투자 자금이 아닌 생활 자금이 먼저예요. 생활비가 부족하면 최악의 타이밍에 팔아야 해요.", insight: "투자의 전제 조건은 '팔지 않아도 되는 상황'을 만드는 것이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "닷컴 버블(2000)에서 배울 수 있는 가장 중요한 교훈은?", options: ["기대와 현실의 괴리가 클수록 버블은 위험하다", "기술주는 항상 위험하다", "미국 시장은 투자하면 안 된다", "분산 투자는 버블에서 무의미하다"], correctIndex: 0, explanation: "2000년 당시 수익 없는 닷컴 기업이 수백 배 상승했어요. 기대가 현실을 너무 앞서면 버블이에요.", insight: "'이번엔 다르다(This time is different)'는 역사상 가장 비싼 네 단어예요." },
];

// ===== 판단력 (Judgment) =====
const judgmentQuestions: QuizQuestion[] = [
  // --- existing ---
  { format: "ox", difficulty: "beginner", category: "judgment", statement: "유명한 투자자가 추천한 주식은 무조건 사야 한다", answer: false, explanation: "어떤 전문가도 100% 맞지 않아요. 중요한 건 '왜'라는 이유를 스스로 이해하는 것이에요.", insight: "남의 결론이 아니라, 자신만의 판단 근거를 갖는 것이 진짜 실력이에요." },
  { format: "ox", difficulty: "beginner", category: "judgment", statement: "좋은 기업과 좋은 투자는 항상 같은 것이다", answer: false, explanation: "좋은 기업이라도 너무 비싼 가격에 사면 나쁜 투자가 될 수 있어요. 가격이 중요해요!", insight: "기업의 질과 가격을 동시에 보는 것이 판단력이에요. 하나만 보면 반쪽짜리 판단이에요." },
  { format: "ox", difficulty: "intermediate", category: "judgment", statement: "투자 결정은 빠르게 내릴수록 좋다", answer: false, explanation: "찰리 멍거: '큰 돈은 사는 것과 파는 것에서가 아니라, 기다리는 것에서 번다.'", insight: "좋은 판단은 시간이 걸려요. 서두르는 것은 거의 항상 감정의 신호예요." },
  { format: "ox", difficulty: "advanced", category: "judgment", statement: "하워드 막스의 '2차적 사고'는 남들의 생각까지 고려하는 역발상 사고다", answer: true, explanation: "'이 주식이 좋다'가 1차 사고, '남들은 어떻게 생각하고 그것이 가격에 반영됐는가'가 2차 사고예요.", insight: "대부분의 사람은 1차적으로만 생각해요. 한 단계 더 생각하면 시장을 이길 수 있어요." },
  { format: "multiple_choice", difficulty: "beginner", category: "judgment", question: "투자 결정을 내릴 때 가장 중요한 질문은?", options: ["'내가 틀릴 수 있는 이유는 무엇인가?'", "'얼마나 벌 수 있는가?'", "'다른 사람들은 뭘 사는가?'", "'언제 가장 많이 오를까?'"], correctIndex: 0, explanation: "찰리 멍거: '항상 뒤집어서 생각하라(Invert, always invert).' 반대 상황을 먼저 생각하세요.", insight: "수익 가능성보다 손실 가능성을 먼저 따지는 습관이 장기적으로 더 큰 수익을 가져다줘요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "judgment", question: "당신의 분석과 시장의 반응이 다를 때, 가장 현명한 태도는?", options: ["내 분석의 약점을 다시 점검한다", "시장이 틀렸다고 확신한다", "즉시 시장을 따라간다", "투자를 포기한다"], correctIndex: 0, explanation: "시장이 틀릴 수도 있지만, 내가 틀릴 확률이 더 높아요. 겸손하게 재점검하는 것이 현명해요.", insight: "좋은 투자자는 확신에 빠지지 않아요. 항상 '내가 놓친 것이 있을까?'를 물어봐요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "찰리 멍거가 강조한 '능력의 원(Circle of Competence)'이란?", options: ["자기가 잘 아는 영역에만 투자하라", "가능한 많은 분야에 투자하라", "전문가의 의견을 따르라", "트렌드를 빠르게 좇으라"], correctIndex: 0, explanation: "'적게 알더라도 확실히 알아야 한다.' 자신의 능력 범위를 아는 것이 진짜 지혜예요.", insight: "모르면서 아는 척하는 것이 가장 위험해요. '모른다'고 인정하는 것이 현명함의 시작이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "judgment", sentence: "찰리 멍거: '항상 뒤집어서 생각하라. ___, always ___.'", answer: "Invert", hints: ["Invert", "뒤집어"], explanation: "성공하려면 어떻게 해야 할까가 아니라, '어떻게 하면 실패할까'를 먼저 생각하세요.", insight: "실패를 피하는 것이 성공을 추구하는 것보다 더 확실한 전략이에요." },
  { format: "fill_blank", difficulty: "intermediate", category: "judgment", sentence: "피터 린치: '자기가 ___ 것에 투자하라'", answer: "아는", hints: ["아는", "이해하는"], explanation: "이해하지 못하는 기업에 투자하면 위기 때 확신을 가질 수 없어요.", insight: "이해하는 기업에 투자하면 폭락 때도 흔들리지 않아요. 확신은 이해에서 나옵니다." },
  { format: "fill_blank", difficulty: "advanced", category: "judgment", sentence: "벤저민 그레이엄: 단기적으로 시장은 투표 기계이지만, 장기적으로는 ___ 기계다", answer: "저울", hints: ["저울", "체중계"], explanation: "단기에는 인기(감정)에 의해 움직이지만, 장기에는 기업의 실제 가치를 반영해요.", insight: "단기적 소음에 흔들리지 마세요. 장기적으로 가치는 반드시 인정받아요." },

  // --- NEW advanced 10 ---
  { format: "ox", difficulty: "advanced", category: "judgment", statement: "컨센서스(다수 의견)와 같은 판단을 하면 시장 평균 이상의 수익을 얻을 수 있다", answer: false, explanation: "컨센서스는 이미 가격에 반영돼 있어요. 평균 이상의 수익을 내려면 비컨센서스적 올바른 판단이 필요해요.", insight: "남들과 같은 생각을 하면 남들과 같은 결과를 얻어요. 차별화된 관점이 핵심이에요." },
  { format: "ox", difficulty: "advanced", category: "judgment", statement: "좋은 투자 아이디어는 처음 들었을 때 편안하게 느껴져야 한다", answer: false, explanation: "하워드 막스: '최고의 투자는 처음에 불편하게 느껴진다.' 편안한 투자는 이미 모두가 알고 있는 것.", insight: "불편함을 느낄 때가 오히려 기회일 수 있어요. 편안함은 군중 속에 있다는 신호예요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "워런 버핏이 20개의 펀치 카드 비유로 말하고자 하는 것은?", options: ["평생 20번만 투자할 수 있다고 생각하면 더 신중해진다", "20개 이상 종목에 분산해야 한다", "20년 이상 보유해야 한다", "20% 이상 하락하면 매도해야 한다"], correctIndex: 0, explanation: "기회의 수를 제한하면 하나하나의 결정에 더 깊이 고민하게 돼요.", insight: "결정의 '질'이 '양'보다 중요해요. 적게 결정하되, 깊이 결정하세요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "체크리스트 투자법이 효과적인 이유는?", options: ["감정과 편향이 개입할 여지를 구조적으로 줄여준다", "수익률이 보장되기 때문", "모든 투자에 동일한 기준을 적용하기 때문", "전문가가 만들었기 때문"], correctIndex: 0, explanation: "아툴 가완디의 '체크리스트 매니페스토'처럼, 단순한 체크리스트가 전문가의 실수도 줄여줘요.", insight: "시스템이 감정을 이깁니다. 좋은 프로세스를 만들면 좋은 결과는 따라와요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "안전마진(Margin of Safety)의 핵심 개념은?", options: ["분석이 틀릴 가능성을 미리 가격에 반영하는 것", "최대 수익을 위해 저가에 매수하는 것", "손절 라인을 정하는 것", "분산 투자의 다른 이름"], correctIndex: 0, explanation: "그레이엄: '안전마진은 실수를 허용하는 여유 공간이다.' 완벽한 분석은 없기 때문에 버퍼가 필요해요.", insight: "자신의 분석을 100% 믿지 않는 것이 역설적으로 더 안전한 투자를 만들어요." },
  { format: "fill_blank", difficulty: "advanced", category: "judgment", sentence: "하워드 막스: '시장에서 초과 수익을 내려면 비컨센서스적이면서 ___야 한다'", answer: "옳아", hints: ["옳아야", "맞아야"], explanation: "남들과 다르게 생각하면서 틀리면 더 크게 잃어요. 다르면서 옳아야 의미가 있어요.", insight: "단순히 반대하는 것은 역발상이 아니에요. 깊은 분석 위의 다른 결론이 진짜 역발상이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "judgment", sentence: "세스 클라만: '투자에서 가장 중요한 세 단어는 ___ ___이다'", answer: "안전 마진", hints: ["안전 마진", "margin of safety"], explanation: "불확실한 세상에서 버퍼 없이 투자하는 것은 안전벨트 없이 운전하는 것과 같아요.", insight: "겸손함의 수학적 표현이 안전마진이에요. 항상 여유를 두세요." },
  { format: "ox", difficulty: "advanced", category: "judgment", statement: "정량 분석만으로 완벽한 투자 결정을 내릴 수 있다", answer: false, explanation: "숫자는 과거를 보여줄 뿐, 미래의 경영진 역량, 문화, 혁신 가능성은 정성적 판단이 필요해요.", insight: "숫자와 이야기를 모두 읽을 줄 아는 것이 균형 잡힌 판단이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "첫인상 효과(primacy effect)가 투자에서 위험한 이유는?", options: ["처음 접한 정보에 과도하게 영향받아 후속 정보를 무시하기 때문", "첫 투자가 항상 실패하기 때문", "첫 번째 종목만 분석하기 때문", "신규 상장주가 항상 비싸기 때문"], correctIndex: 0, explanation: "첫 인상(첫 번째 리포트, 첫 번째 뉴스)이 이후 모든 판단을 왜곡할 수 있어요.", insight: "다양한 시각에서 정보를 재검토하는 습관이 편향을 줄여줘요." },
  { format: "ox", difficulty: "advanced", category: "judgment", statement: "복잡한 투자 전략일수록 더 높은 수익을 낸다", answer: false, explanation: "보글: '단순함이 복잡함을 이긴다.' 역사적으로 인덱스 펀드가 대부분의 헤지펀드를 이겼어요.", insight: "투자에서 복잡함은 대개 불필요한 비용과 위험을 추가할 뿐이에요." },
];

// ===== 핵심 철학 문제 (7가지 원칙 기반) =====
const philosophyQuestions: QuizQuestion[] = [
  // 원칙1: 경제적 불확실성은 변하지 않음 - 사람들의 위험 인식이 변할 뿐
  { format: "ox", difficulty: "intermediate", category: "risk", statement: "경제 위기가 반복되는 이유는 경제 구조가 근본적으로 바뀌기 때문이다", answer: false, explanation: "경제적 불확실성은 거의 변하지 않아요. 달라지는 건 사람들이 위험을 얼마나 모르고 있었는지예요.", insight: "위기의 원인은 경제가 아니라 '사람들의 기억력'이에요. 좋은 시절에 위험을 잊는 것이 문제." },
  { format: "multiple_choice", difficulty: "intermediate", category: "risk", question: "2008년, 2020년, 모든 위기의 공통 원인은?", options: ["사람들이 위험을 과소평가하고 있었다", "경제 시스템이 완전히 새로운 문제를 맞았다", "정부가 개입하지 않았다", "기술 발전이 너무 빨랐다"], correctIndex: 0, explanation: "위기 전에는 항상 '이번은 다르다'고 했어요. 변하는 건 경제가 아니라 사람들의 자만심이에요.", insight: "위험을 느끼지 못하는 순간이 가장 위험해요. 이 역설을 아는 것만으로도 반은 대비한 겁니다." },

  // 원칙2: 부를 쌓는 법 = 자존심 < 수입 유지
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "수입이 많으면 자동으로 부자가 된다", answer: false, explanation: "부를 쌓는 핵심은 단순해요: 자존심을 수입 아래로 유지하는 것. 얼마를 버느냐가 아니라 얼마를 남기느냐가 중요해요.", insight: "연봉 1억이어도 1.2억을 쓰면 빈곤해요. 연봉 5천이어도 3천만 쓰면 부자가 돼요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "judgment", question: "모건 하우절이 말한 '부의 가장 큰 적'은?", options: ["기대가 수입보다 빨리 커지는 것", "인플레이션", "높은 세금", "투자 실패"], correctIndex: 0, explanation: "돈이 많아져도 기대가 더 빨리 커지면 영원히 만족할 수 없어요. 부는 숫자가 아니라 만족감이에요.", insight: "행복한 투자자는 '더 벌려는 사람'이 아니라 '충분함을 아는 사람'이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "psychology", sentence: "부를 쌓는 가장 확실한 방법: 자존심을 ___ 아래로 유지하기", answer: "수입", hints: ["수입", "소득"], explanation: "부는 남에게 보여주는 것이 아니에요. 남에게 보여주려고 쓰는 돈이 부를 갈아먹어요.", insight: "진짜 부자는 '부자처럼 보이지 않는 사람'일 확률이 높아요." },

  // 원칙3: FOMO가 없다는 것 = 중요한 투자 능력
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "FOMO(놓칠까봐 불안한 마음)를 느끼지 않는 것은 투자에서 중요한 능력이다", answer: true, explanation: "FOMO가 없다는 건 남의 수익에 흔들리지 않는다는 뜻이에요. 이것 자체가 매우 중요한 투자 능력이에요.", insight: "다른 사람이 돈을 번 건 당신이 돈을 잃은 게 아니에요. 이걸 체화하면 투자가 편해져요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "FOMO에 휘둘리지 않는 가장 좋은 방법은?", options: ["자신만의 투자 원칙과 기준을 미리 세우기", "SNS를 더 많이 보며 정보 수집하기", "남들보다 빨리 매수하기", "모든 상승 종목에 분산 투자하기"], correctIndex: 0, explanation: "원칙이 있으면 '남들이 뭘 하든' 자기 기준으로 판단할 수 있어요. FOMO는 원칙 없는 사람을 공격해요.", insight: "원칙이 없으면 감정이 원칙이 돼요. 감정은 가장 나쁜 투자 전략이에요." },

  // 원칙4: 과거 하락 = 기회, 미래 하락 = 위험 (비대칭 심리)
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "과거의 주가 하락을 보면 '기회였다'고 느끼면서, 미래의 하락을 '위험'으로 느끼는 것은 자연스러운 심리다", answer: true, explanation: "이것은 '후행 편향'이에요. 과거는 결과를 아니까 기회로 보이지만, 현재는 불확실하니까 위험으로 느껴요.", insight: "지금 느끼는 공포는 10년 후에 '왜 그때 안 샀을까'가 될 수 있어요. 이 비대칭을 인식하세요." },
  { format: "multiple_choice", difficulty: "advanced", category: "judgment", question: "2020년 3월 코로나 폭락을 지금 보면 '기회'로 보이지만, 당시에는 공포였습니다. 이 차이를 만드는 것은?", options: ["결과를 알고 보는 것과 모르고 경험하는 것의 차이", "당시 시장이 실제로 더 위험했기 때문", "투자 경험이 부족했기 때문", "뉴스가 과장했기 때문"], correctIndex: 0, explanation: "미래 하락도 10년 후엔 '기회'로 보일 거예요. 이 관점의 전환이 장기 투자자의 핵심 역량이에요.", insight: "현재의 불확실함을 '미래의 기회'로 재해석할 수 있다면, 당신은 이미 대부분보다 앞서 있어요." },

  // 원칙5: 돈의 본질적 가치 = 시간 통제권
  { format: "ox", difficulty: "beginner", category: "judgment", statement: "돈의 진짜 가치는 더 큰 집이나 차를 사는 것이다", answer: false, explanation: "돈의 가장 큰 가치는 '시간을 통제할 수 있는 능력'이에요. 아침에 일어나 '오늘 내가 원하는 것을 하겠다'고 말할 수 있는 자유요.", insight: "더 많이 사는 것이 아니라, 더 자유롭게 사는 것이 돈의 진짜 목적이에요." },
  { format: "fill_blank", difficulty: "intermediate", category: "judgment", sentence: "돈의 본질적 가치는 물건을 사는 것이 아니라 ___ 통제권이다", answer: "시간", hints: ["시간", "자유"], explanation: "모건 하우절: 돈이 주는 최고의 배당은 시간에 대한 자유예요.", insight: "투자의 목표를 '수익률'이 아닌 '자유'로 바꾸면 더 현명한 결정을 하게 돼요." },

  // 원칙6: 자기도 모르게 놓치는 것들
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "투자자가 '자기도 모르게' 가장 많이 놓치는 것은?", options: ["자신의 감정이 결정에 미치는 영향", "좋은 매수 타이밍", "고수익 종목 정보", "세금 최적화 방법"], correctIndex: 0, explanation: "대부분의 투자 실수는 분석 부족이 아니라 감정 인식 부족에서 와요. 자기 감정을 모르면 자기를 통제할 수 없어요.", insight: "투자 일기를 쓰는 것이 바로 이 '무의식적 감정'을 의식하는 가장 좋은 방법이에요." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "투자 결정을 내릴 때 '나는 감정에 영향받지 않는다'고 생각하는 사람이 실제로 가장 많이 영향받는다", answer: true, explanation: "감정을 인식하지 못하는 것이 가장 위험해요. '나는 냉철하다'는 믿음이 편향을 더 강화시켜요.", insight: "자기 편향을 인정하는 것이 편향에서 벗어나는 첫걸음이에요." },
];

// Combine all questions
export const allQuestions: QuizQuestion[] = [
  ...riskQuestions,
  ...psychologyQuestions,
  ...crisisQuestions,
  ...judgmentQuestions,
  ...philosophyQuestions,
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

// Personalize quiz questions with user's holdings
export function personalizeQuiz(question: QuizQuestion, holdingNames: string[]): QuizQuestion {
  if (holdingNames.length === 0) return question;
  const name = holdingNames[Math.floor(Math.random() * holdingNames.length)];
  
  const q = { ...question };
  
  // Replace generic stock references with user's holding
  const replacements: [RegExp, string][] = [
    [/특정 종목/g, name],
    [/OO 주식/g, `${name} 주식`],
    [/한 종목/g, name],
    [/어떤 기업/g, name],
  ];
  
  if (q.format === "ox") {
    const ox = q as OXQuestion;
    replacements.forEach(([regex, rep]) => { ox.statement = ox.statement.replace(regex, rep); });
  } else if (q.format === "multiple_choice") {
    const mc = q as MultipleChoiceQuestion;
    replacements.forEach(([regex, rep]) => { mc.question = mc.question.replace(regex, rep); });
  } else if (q.format === "fill_blank") {
    const fb = q as FillBlankQuestion;
    replacements.forEach(([regex, rep]) => { fb.sentence = fb.sentence.replace(regex, rep); });
  }
  
  return q;
}
