// 심리 확장 팩 — 하락 구간별 반응, FOMO, 뉴스 공포
import type { QuizQuestion } from "@/data/quizTypes";

export const psychologyPlusQuestions: QuizQuestion[] = [
  // -15% / -25% / -40% 구간 반응
  { format: "multiple_choice", difficulty: "beginner", category: "crisis", question: "보유 종목이 -15%입니다. 계획을 미리 세운 사람의 행동은?", options: ["1차 분할매수 구간인지 확인한다", "전량 매도한다", "SNS에서 위로를 찾는다", "계좌를 지운다"], correctIndex: 0, explanation: "구간 대응은 감정을 배제해줘요. 이미 정해둔 행동을 실행할 뿐이에요.", insight: "미리 적은 계획은 위기에 나를 대신해 판단해줍니다." },
  { format: "multiple_choice", difficulty: "intermediate", category: "crisis", question: "-25% 구간에서 가장 흔한 실수는?", options: ["'더 떨어질 것 같다'는 느낌으로 계획을 중단한다", "계획대로 나눠 산다", "사업 상태를 점검한다", "기록을 남긴다"], correctIndex: 0, explanation: "가장 무서울 때 계획을 버리면, 계획을 세운 의미가 사라져요.", insight: "계획은 편할 때가 아니라 무서울 때 쓰려고 만든 거예요." },
  { format: "ox", difficulty: "intermediate", category: "crisis", statement: "-40%는 우량 기업 역사에서 여러 번 있었던 일이다", answer: true, explanation: "빅테크도 -40% 이상의 하락을 여러 번 겪고 신고가를 갱신했어요.", insight: "역사를 알면 폭락이 '처음 있는 일'로 느껴지지 않아요." },
  { format: "ox", difficulty: "beginner", category: "crisis", statement: "하락장에서 계좌를 자주 확인하면 잘 버틸 수 있다", answer: false, explanation: "확인 빈도가 늘면 패닉 매도 확률도 올라가요.", insight: "덜 보는 것이 더 잘 버티는 방법입니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "crisis", question: "폭락장에서 '팔고 나중에 다시 사겠다'는 계획의 함정은?", options: ["파는 건 쉽지만 다시 사는 시점은 결정하지 못한다", "수수료가 두 번 든다는 점만 문제다", "세금이 없어서 문제다", "함정이 없다"], correctIndex: 0, explanation: "대부분은 더 높은 가격에서 돌아오거나 아예 돌아오지 못해요.", insight: "매도는 한 번의 결정이지만 재매수는 매일의 고통이에요." },

  // FOMO
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "남이 돈을 벌었다는 소식은 투자 정보가 아니라 감정 자극이다", answer: true, explanation: "FOMO는 원칙을 무너뜨리는 가장 흔한 경로예요.", insight: "부러움은 분석이 아니에요." },
  { format: "multiple_choice", difficulty: "beginner", category: "psychology", question: "급등 뉴스를 봤을 때 우리 원칙에 맞는 행동은?", options: ["내 원칙 안의 회사인지 먼저 확인한다", "일단 소액이라도 산다", "레버리지로 따라간다", "리딩방에 가입한다"], correctIndex: 0, explanation: "원칙 밖의 급등은 그냥 지나가는 남의 일이에요.", insight: "놓친 기회보다 지킨 원칙이 오래 남아요." },
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "급등한 종목을 늦게 따라 사면 통계적으로 불리한 진입이 되기 쉽다", answer: true, explanation: "성과 추종 편향이에요. 항상 늦게, 비싸게 사게 돼요.", insight: "추격 매수는 남의 수익을 내 손실로 바꾸는 기술이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "psychology", sentence: "놓칠까 봐 두려운 마음을 ___라고 부른다.", answer: "FOMO", hints: ["FOMO", "포모"], explanation: "이름을 붙이면 감정과 거리를 둘 수 있어요.", insight: "감정에 이름을 붙이는 순간 통제력이 생겨요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "FOMO를 구조적으로 줄이는 가장 좋은 방법은?", options: ["살 회사 목록을 미리 4개로 좁혀둔다", "더 많은 종목을 관찰한다", "알림을 더 많이 켠다", "매일 인기 종목을 확인한다"], correctIndex: 0, explanation: "선택지를 줄이면 유혹도 줄어요. 앵커 종목 전략의 심리적 이점이에요.", insight: "좁은 원 안에 있으면 흔들릴 일도 적어요." },

  // 뉴스 공포
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "뉴스는 사실을 전달하면서 동시에 감정을 증폭시킨다", answer: true, explanation: "클릭을 위해 가장 자극적인 표현을 고르기 때문이에요.", insight: "정보는 취하고 감정은 흘려보내세요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "'경기 침체 온다'는 헤드라인을 봤을 때 장기 투자자의 행동은?", options: ["내 회사 사업이 10년 뒤에도 유효한지 확인한다", "전량 현금화한다", "인버스에 투자한다", "뉴스를 더 많이 본다"], correctIndex: 0, explanation: "침체는 반복돼요. 반복되는 것은 계획으로 다룰 수 있어요.", insight: "예상 가능한 사건에 놀라지 않는 것이 훈련의 목적이에요." },
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "공포가 최고조일 때 자산 가격은 보통 가장 비싸다", answer: false, explanation: "공포가 가격을 눌러요. 반대로 모두가 안심할 때가 비싼 시기예요.", insight: "감정의 극단과 가격의 극단은 붙어 있어요." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "뉴스 소비를 줄이는 것이 성과에 도움이 되는 이유는?", options: ["불필요한 행동 충동이 줄어들기 때문", "정보가 필요 없기 때문", "시장이 뉴스와 무관하기 때문", "세금이 줄기 때문"], correctIndex: 0, explanation: "성과를 깎는 건 정보 부족이 아니라 과잉 행동이에요.", insight: "덜 알고 덜 움직이는 편이 더 나은 결과를 낼 때가 많아요." },
  { format: "fill_blank", difficulty: "intermediate", category: "psychology", sentence: "감정을 느끼는 것은 자연스럽다. 문제는 감정에 따른 ___이다.", answer: "행동", hints: ["행동", "반응"], explanation: "우리가 훈련하는 것은 감정 제거가 아니라 행동 통제예요.", insight: "느껴도 되지만, 누르지는 마세요." },

  // 손실 회피 · 자기 관찰
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "손실의 고통은 같은 크기 이익의 기쁨보다 크게 느껴진다", answer: true, explanation: "카너먼의 손실 회피예요. 약 2배 이상으로 느껴져요.", insight: "이 비대칭을 알면 내 패닉을 미리 예측할 수 있어요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "매수 가격에 집착하는 심리를 무엇이라 하나요?", options: ["앵커링", "레버리지", "리밸런싱", "헤지"], correctIndex: 0, explanation: "시장은 내 매수가를 몰라요. 중요한 건 지금의 사업 가치예요.", insight: "지금 이 가격에 다시 살 것인가 — 이게 올바른 질문이에요." },
  { format: "ox", difficulty: "intermediate", category: "psychology", statement: "수익이 난 종목을 빨리 팔고 손실 종목을 오래 붙잡는 경향이 있다", answer: true, explanation: "처분 효과예요. 결과적으로 좋은 회사를 먼저 잃게 돼요.", insight: "승자를 팔고 패자를 남기면 포트폴리오가 나빠집니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "psychology", question: "투자 일지가 심리 편향을 줄여주는 이유는?", options: ["결정 당시의 이유가 남아 사후 합리화를 막기 때문", "수익률을 계산해주기 때문", "세금 신고에 쓰기 때문", "종목을 추천해주기 때문"], correctIndex: 0, explanation: "우리가 매일 한 문장을 남기는 이유예요.", insight: "기록은 나에게 정직해지는 가장 싼 도구예요." },
  { format: "ox", difficulty: "advanced", category: "psychology", statement: "연속으로 수익을 낸 직후가 오히려 위험한 순간일 수 있다", answer: true, explanation: "하우스 머니 효과로 위험을 과소평가하게 돼요.", insight: "이겼을 때 더 조심하세요." },
  { format: "fill_blank", difficulty: "advanced", category: "psychology", sentence: "그레이엄: 투자의 가장 큰 적은 시장이 아니라 자기 자신의 ___이다.", answer: "감정", hints: ["감정", "마음"], explanation: "시장을 이기려 하기 전에 나를 이겨야 해요.", insight: "자기 통제가 유일하게 통제 가능한 변수예요." },
  { format: "multiple_choice", difficulty: "beginner", category: "psychology", question: "주가 확인 빈도를 줄이면 어떤 효과가 있나요?", options: ["충동적 매매가 줄어든다", "수익률이 즉시 2배가 된다", "세금이 사라진다", "배당이 늘어난다"], correctIndex: 0, explanation: "확인은 행동을 부르고, 행동은 비용을 부릅니다.", insight: "좋은 투자는 대체로 지루해요." },
  { format: "ox", difficulty: "beginner", category: "psychology", statement: "투자에서 지루함을 느낀다면 대체로 잘하고 있는 신호다", answer: true, explanation: "짜릿함을 찾는 순간 투자는 도박에 가까워져요.", insight: "재미는 게임에서 찾고, 투자는 조용히 두세요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "psychology", question: "포트폴리오가 한 달 언더퍼폼했을 때 위험한 반응은?", options: ["최근 오른 종목으로 전략을 갈아엎는다", "투자 논거를 점검한다", "기록을 남긴다", "아무것도 하지 않는다"], correctIndex: 0, explanation: "한 달로 전략을 판단할 수 없어요.", insight: "짧은 성과로 긴 전략을 바꾸면 항상 늦습니다." },
];
