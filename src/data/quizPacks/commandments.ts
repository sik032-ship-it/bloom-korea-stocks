// 10계명 심화 팩 — 철학(philosophy) 확장
import type { QuizQuestion } from "@/data/quizTypes";

export const commandmentQuestions: QuizQuestion[] = [
  // #1 좋은 기업 · 비싸지 않게 · 산 다음 아무것도
  { format: "ox", difficulty: "beginner", category: "judgment", statement: "좋은 기업을 골랐다면 매수 후에는 할 일이 거의 없다", answer: true, explanation: "10계명 #1. 산 다음 아무것도 하지 않는 것이 전략이에요.", insight: "할 일이 없는 포트폴리오가 좋은 포트폴리오예요." },
  { format: "multiple_choice", difficulty: "beginner", category: "judgment", question: "'너무 비싸게 사지 마라'가 뜻하는 것은?", options: ["가격을 완전히 무시해도 된다는 뜻은 아니다", "무조건 싼 주식만 사라는 뜻", "고점에서만 사라는 뜻", "가격은 아무 의미 없다는 뜻"], correctIndex: 0, explanation: "좋은 회사가 우선이지만, 극단적으로 비싼 값은 시간을 더 필요하게 만들어요.", insight: "회사가 1순위, 가격이 2순위 — 순서를 바꾸면 안 돼요." },

  // #2 이미 성공한 기업
  { format: "ox", difficulty: "beginner", category: "judgment", statement: "미래의 승자를 먼저 찾아내는 것이 검증된 승자와 함께 가는 것보다 안전하다", answer: false, explanation: "10계명 #2. 예측은 도박이고, 검증된 승자와 함께 가는 건 사업이에요.", insight: "안 맞춰도 되는 전략이 오래 갑니다." },
  { format: "multiple_choice", difficulty: "intermediate", category: "judgment", question: "'이미 성공한 기업에 투자하라'의 실질적 이점은?", options: ["사업 모델이 이미 증명돼 매일 확인할 필요가 없다", "주가가 절대 떨어지지 않는다", "배당이 항상 늘어난다", "경쟁자가 없다"], correctIndex: 0, explanation: "검증된 사업은 마음이 편해요. 마음이 편하면 오래 버틸 수 있어요.", insight: "편안함은 사치가 아니라 장기 보유의 필수 조건이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "judgment", sentence: "미래의 승자를 예측하지 말고, 이미 ___ 승자와 함께 가라.", answer: "검증된", hints: ["검증된"], explanation: "10계명 #2.", insight: "예측을 줄이는 만큼 불안도 줄어요." },

  // #3 마법의 회사 (자본 효율)
  { format: "ox", difficulty: "intermediate", category: "cash_flow", statement: "적은 자본으로 큰 이익을 내는 회사가 시간이 갈수록 유리하다", answer: true, explanation: "10계명 #3. 자본 효율이 높으면 벌어들인 돈을 다시 높은 수익률로 굴릴 수 있어요.", insight: "재투자 수익률이 높은 회사가 복리 기계예요." },
  { format: "multiple_choice", difficulty: "advanced", category: "cash_flow", question: "ROIC가 높은 사업의 공통 특징은?", options: ["설비 투자 부담이 작고 무형 자산이 핵심", "공장이 매우 많음", "직원 수가 가장 많음", "부채 비율이 높음"], correctIndex: 0, explanation: "소프트웨어·플랫폼·브랜드가 대표적이에요.", insight: "무형 자산은 복사 비용이 없어 이익률을 밀어올려요." },
  { format: "ox", difficulty: "advanced", category: "cash_flow", statement: "매출 성장률이 높으면 자본 효율은 따로 볼 필요가 없다", answer: false, explanation: "돈을 태워가며 만든 성장은 오래가지 못해요. 성장의 질을 봐야 해요.", insight: "성장은 속도, 자본 효율은 연비예요." },

  // #4 브랜드 해자
  { format: "ox", difficulty: "beginner", category: "brand_moat", statement: "공장과 기계는 돈으로 살 수 있지만 브랜드와 신뢰는 살 수 없다", answer: true, explanation: "10계명 #4. 그래서 브랜드가 진짜 해자예요.", insight: "돈으로 복제 가능한 건 해자가 될 수 없어요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "brand_moat", question: "브랜드 해자가 재무제표에 나타나는 방식은?", options: ["가격을 올려도 고객이 남아 높은 이익률로 나타난다", "매출원가가 0이 된다", "부채가 사라진다", "직원 수가 줄어든다"], correctIndex: 0, explanation: "가격 결정력이 곧 브랜드의 숫자예요.", insight: "이익률은 브랜드 사랑의 회계적 흔적입니다." },
  { format: "fill_blank", difficulty: "intermediate", category: "brand_moat", sentence: "강력한 브랜드 + 고객 충성도 = 진짜 ___다.", answer: "해자", hints: ["해자", "moat"], explanation: "10계명 #4.", insight: "해자는 성벽이 아니라 고객의 마음이에요." },

  // #5 매일 반복 소비
  { format: "ox", difficulty: "beginner", category: "brand_moat", statement: "경기가 나빠도 사람들이 계속 쓰는 제품은 사업 안정성이 높다", answer: true, explanation: "10계명 #5. 일상에 박힌 제품은 불황에도 잘 버텨요.", insight: "습관이 곧 매출의 보험이에요." },
  { format: "multiple_choice", difficulty: "beginner", category: "brand_moat", question: "다음 중 '매일 반복 소비'에 가장 가까운 것은?", options: ["매일 쓰는 검색·업무 소프트웨어·스마트폰", "1년에 한 번 살까 고민하는 고가 취미용품", "유행에 따라 바뀌는 테마 상품", "한 번 쓰고 버리는 이벤트 상품"], correctIndex: 0, explanation: "반복 사용은 반복 매출을 만들고, 반복 매출은 예측 가능성을 줘요.", insight: "예측 가능한 매출이 잠을 잘 자게 해줍니다." },

  // #6 부채
  { format: "ox", difficulty: "intermediate", category: "risk", statement: "부채가 적은 기업은 위기 때 선택권이 더 많다", answer: true, explanation: "10계명 #6. 빚이 없으면 불황에 자산을 급매할 필요가 없어요.", insight: "위기에 살아남는 회사가 위기 후 시장을 가져갑니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "risk", question: "레버리지 없이 높은 수익을 내는 회사가 특별한 이유는?", options: ["사업 자체의 힘으로 벌기 때문에 금리 변화에 덜 흔들린다", "세금을 안 내기 때문", "규제를 받지 않기 때문", "배당을 안 주기 때문"], correctIndex: 0, explanation: "빚으로 만든 수익률은 금리가 오르면 사라져요.", insight: "빌린 힘은 언제든 회수당할 수 있는 힘이에요." },

  // #7 싸다는 이유
  { format: "ox", difficulty: "intermediate", category: "judgment", statement: "PER이 낮으면 그것만으로 좋은 투자 기회다", answer: false, explanation: "10계명 #7. 싸 보이는 데는 이유가 있어요. 가치투자는 낮은 PER이 아니에요.", insight: "싼 게 아니라 망가지는 중일 수도 있어요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "judgment", question: "'가치 함정(value trap)'에 빠지지 않는 방법은?", options: ["가격이 아니라 사업의 미래 경쟁력을 먼저 본다", "가장 낮은 PER부터 순서대로 산다", "적자 기업을 우선 고른다", "배당수익률만 본다"], correctIndex: 0, explanation: "싼 이유가 일시적인지 구조적인지 구분하는 게 핵심이에요.", insight: "구조적으로 나빠지는 회사는 영원히 싸 보입니다." },
  { format: "fill_blank", difficulty: "beginner", category: "judgment", sentence: "싸다는 이유만으로 ___를 사지 마라.", answer: "쓰레기", hints: ["쓰레기"], explanation: "10계명 #7.", insight: "할인된 가격표보다 회사의 미래가 중요해요." },

  // #8 시간은 위대한 기업의 편
  { format: "ox", difficulty: "beginner", category: "where_not_when", statement: "훌륭한 기업이라면 조금 비싸게 산 실수도 시간이 희석해준다", answer: true, explanation: "10계명 #8. 시간은 위대한 기업의 편이에요.", insight: "좋은 회사에서는 시간이 실수를 지워줍니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "where_not_when", question: "시간이 평범한 기업에게는 적이 되는 이유는?", options: ["경쟁에 이익률이 계속 깎이기 때문", "세금이 늘기 때문", "주식 수가 줄기 때문", "배당이 사라지기 때문"], correctIndex: 0, explanation: "해자가 없으면 좋은 사업은 곧 남의 사업이 돼요.", insight: "해자 없는 성장은 빌려온 성장이에요." },

  // #9 현금흐름
  { format: "ox", difficulty: "beginner", category: "cash_flow", statement: "회계상 이익이 늘었다면 현금도 반드시 늘어난다", answer: false, explanation: "10계명 #9. 이익은 계산이고 현금은 사실이에요. 둘은 자주 다릅니다.", insight: "통장에 꽂히는 돈만 진실이에요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "cash_flow", question: "잉여현금흐름(FCF)이 중요한 이유는?", options: ["배당·자사주·재투자에 실제로 쓸 수 있는 돈이기 때문", "세무 신고에 필요하기 때문", "주가를 예측해주기 때문", "부채를 숨겨주기 때문"], correctIndex: 0, explanation: "FCF가 주주 환원과 성장의 재료예요.", insight: "FCF가 없는 성장은 남의 돈으로 하는 성장이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "cash_flow", sentence: "장부상 이익이 아니라 ___가 진실이다.", answer: "현금흐름", hints: ["현금흐름", "FCF"], explanation: "10계명 #9.", insight: "이익은 의견, 현금은 사실." },

  // #10 타이밍
  { format: "ox", difficulty: "beginner", category: "where_not_when", statement: "우리가 결정할 수 있는 것은 타이밍이 아니라 머무를 곳이다", answer: true, explanation: "10계명 #10. Where, not When.", insight: "통제할 수 없는 걸 놓으면 마음이 편해져요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "no_bottom_fishing", question: "'바닥에서 사겠다'는 계획의 가장 큰 문제는?", options: ["바닥은 지나간 뒤에만 알 수 있어 결국 못 사게 된다", "수수료가 비싸다", "세금이 많다", "증권사가 막는다"], correctIndex: 0, explanation: "버핏도 바닥은 몰라요. 그래서 구간 분할매수를 합니다.", insight: "완벽한 진입을 기다리다 20년을 놓칠 수 있어요." },
  { format: "ox", difficulty: "advanced", category: "no_bottom_fishing", statement: "부자들은 폭락 때 바닥을 정확히 맞춰서 사들인다", answer: false, explanation: "그들은 미리 정한 구간에서 계획대로 나눠 삽니다. 예측이 아니라 규칙이에요.", insight: "부의 비밀은 예측력이 아니라 실행력이에요." },

  // 겸손 / 능력의 원
  { format: "ox", difficulty: "beginner", category: "humility", statement: "설명할 수 없는 투자는 오래 버티기 어렵다", answer: true, explanation: "능력의 원 밖의 투자는 흔들릴 때 근거가 없어 팔게 돼요.", insight: "설명 가능성이 곧 버티는 힘이에요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "humility", question: "복잡한 금융상품을 아예 다루지 않는 이유는?", options: ["복잡함 속에 위험이 숨기 때문", "수익이 너무 낮기 때문", "거래가 불가능하기 때문", "세금이 높기 때문"], correctIndex: 0, explanation: "2008년 CDO가 그 교훈이에요. 이해 못하면 곧 도박입니다.", insight: "복잡함은 종종 위험의 포장지예요." },
  { format: "fill_blank", difficulty: "intermediate", category: "humility", sentence: "모르는 종목과 복잡한 비즈니스에 손대는 것은 겸손이 아니라 ___이다.", answer: "오만", hints: ["오만", "자만"], explanation: "능력의 원을 넘는 순간 확률은 우리 편이 아니에요.", insight: "패스하는 능력이 실력의 절반입니다." },

  // 레전드의 지혜 확장
  { format: "ox", difficulty: "beginner", category: "legend_wisdom", statement: "버핏은 진짜 큰 피해는 예상하지 못한 곳에서 온다고 말했다", answer: true, explanation: "그래서 예측보다 대비가 중요해요.", insight: "대비는 예측의 실패를 견디게 해줍니다." },
  { format: "multiple_choice", difficulty: "intermediate", category: "legend_wisdom", question: "피터 린치가 말한 투자자의 진짜 손실 원인은?", options: ["폭락할 때 팔아버리기 때문", "너무 오래 보유하기 때문", "배당을 재투자하기 때문", "너무 적게 매매하기 때문"], correctIndex: 0, explanation: "하락 자체가 아니라 하락에 반응하는 행동이 손실을 확정시켜요.", insight: "손실은 가격이 아니라 매도 버튼이 만듭니다." },
  { format: "fill_blank", difficulty: "beginner", category: "legend_wisdom", sentence: "버핏의 이상적인 보유 기간은 ___이다.", answer: "영원", hints: ["영원", "영원히"], explanation: "좋은 회사라면 팔 이유를 찾기가 더 어려워요.", insight: "사는 것보다 안 파는 것이 어렵습니다." },
  { format: "ox", difficulty: "intermediate", category: "legend_wisdom", statement: "찰리 멍거는 '아무것도 하지 않는 능력'을 투자의 큰 미덕으로 봤다", answer: true, explanation: "기회가 올 때까지 기다리고, 산 뒤엔 가만히 있는 것 — 둘 다 인내예요.", insight: "인내는 수익률로 보상받는 유일한 감정이에요." },
];
