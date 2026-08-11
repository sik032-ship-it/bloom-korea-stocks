// 앵커 종목(Big 4) 기초 팩 — MSFT · GOOGL · AMZN · AAPL
// 목적: "10년 뒤에도 쓸 제품을 파는 회사"를 사실 기반으로 이해하기
import type { QuizQuestion } from "@/data/quizTypes";

export const big4Questions: QuizQuestion[] = [
  // ---- Apple ----
  { format: "ox", difficulty: "beginner", category: "big4_basics", statement: "애플의 가장 강력한 해자는 공장 설비다", answer: false, explanation: "10계명 #4. 공장·기계는 누구나 돈으로 살 수 있어요. 애플의 해자는 브랜드와 생태계 충성도예요.", insight: "살 수 있는 건 해자가 아니에요. 살 수 없는 것만 해자예요." },
  { format: "multiple_choice", difficulty: "beginner", category: "big4_basics", question: "애플 사용자가 쉽게 안드로이드로 옮기지 못하는 가장 큰 이유는?", options: ["기기·서비스가 서로 묶인 생태계(전환 비용)", "애플 기기가 더 저렴해서", "안드로이드가 판매되지 않아서", "통신사가 막아서"], correctIndex: 0, explanation: "아이폰·맥·워치·아이클라우드가 서로 연결돼 있어 떠나는 비용이 커요. 이게 전환 비용 해자예요.", insight: "떠나기 불편한 제품은 가격을 올려도 고객이 남아요." },
  { format: "ox", difficulty: "intermediate", category: "big4_basics", statement: "애플의 서비스 부문(앱스토어·아이클라우드 등)은 하드웨어보다 이익률이 높다", answer: true, explanation: "서비스는 추가 원가가 거의 없어 이익률이 매우 높아요. 반복 구독이라 예측도 쉽죠.", insight: "매일 반복 소비되는 수익원은 경기에 덜 흔들려요." },
  { format: "fill_blank", difficulty: "beginner", category: "big4_basics", sentence: "애플의 진짜 해자는 설비가 아니라 ___와 고객 충성도다.", answer: "브랜드", hints: ["브랜드"], explanation: "10계명 #4. 신뢰는 돈으로 살 수 없어요.", insight: "브랜드는 가격 결정력이고, 가격 결정력은 곧 이익이에요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "big4_basics", question: "애플이 매년 자기 주식을 대규모로 사들이는 것(자사주 매입)이 주주에게 주는 효과는?", options: ["주식 수가 줄어 주당 가치가 올라간다", "매출이 늘어난다", "직원 수가 늘어난다", "세금이 사라진다"], correctIndex: 0, explanation: "남는 현금으로 주식 수를 줄이면 같은 이익을 더 적은 주주가 나눠 가져요.", insight: "현금이 많은 회사는 주주에게 조용히 돌려주는 방법을 압니다." },

  // ---- Microsoft ----
  { format: "ox", difficulty: "beginner", category: "big4_basics", statement: "마이크로소프트 오피스와 윈도우는 기업 업무에 깊게 박혀 있어 교체가 어렵다", answer: true, explanation: "회사 전체 문서·메일·인증이 묶여 있어요. 바꾸려면 전 직원 재교육이 필요하죠.", insight: "업무 습관에 박힌 제품은 해지 버튼을 누르기 어려워요." },
  { format: "multiple_choice", difficulty: "beginner", category: "big4_basics", question: "마이크로소프트의 클라우드(애저)가 안정적인 수익원인 이유는?", options: ["기업이 매달 구독료를 내는 반복 매출 구조", "한 번 팔면 끝나는 일회성 판매라서", "광고를 많이 팔아서", "정부 보조금 때문"], correctIndex: 0, explanation: "구독 매출은 매달 자동으로 들어와요. 경기가 흔들려도 기업은 서버를 끄지 못하죠.", insight: "반복 결제되는 매출이 가장 튼튼한 매출이에요." },
  { format: "ox", difficulty: "intermediate", category: "big4_basics", statement: "소프트웨어 회사는 제품을 한 개 더 팔 때 드는 추가 비용이 거의 0에 가깝다", answer: true, explanation: "10계명 #3. 적은 자본으로 큰 이익 — 그래서 소프트웨어는 \"마법의 회사\"예요.", insight: "복사 비용이 0인 사업은 규모가 커질수록 이익률이 올라가요." },
  { format: "fill_blank", difficulty: "intermediate", category: "big4_basics", sentence: "적은 자본으로 큰 이익을 내는 회사를 판별하는 대표 지표는 ___다.", answer: "ROIC", hints: ["ROIC", "투자자본수익률"], explanation: "10계명 #3. 투입한 자본 대비 얼마를 벌어오는지가 사업의 질이에요.", insight: "매출 크기보다 자본 효율이 회사의 체급을 말해줍니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "big4_basics", question: "기업용 소프트웨어가 가격을 올려도 고객이 잘 떠나지 않는 이유를 한 단어로?", options: ["전환 비용", "광고 효과", "환율", "배당"], correctIndex: 0, explanation: "옮기는 데 드는 시간·교육·위험이 인상분보다 크면 고객은 남아요.", insight: "전환 비용은 눈에 안 보이지만 가장 단단한 해자예요." },

  // ---- Google ----
  { format: "ox", difficulty: "beginner", category: "big4_basics", statement: "구글 검색은 사용자가 많아질수록 검색 품질이 더 좋아지는 구조다", answer: true, explanation: "검색 데이터가 쌓이면 결과가 정교해지고, 좋아진 결과가 다시 사용자를 불러와요.", insight: "쓰면 쓸수록 좋아지는 제품은 후발주자가 따라잡기 어려워요." },
  { format: "multiple_choice", difficulty: "beginner", category: "big4_basics", question: "구글 매출의 가장 큰 비중을 차지하는 것은?", options: ["광고", "스마트폰 판매", "자동차", "은행 수수료"], correctIndex: 0, explanation: "검색·유튜브 광고가 핵심 현금원이에요. 사람들의 \"검색하는 습관\"이 곧 매출이죠.", insight: "일상 습관에 박힌 서비스는 매출도 습관처럼 반복돼요." },
  { format: "ox", difficulty: "intermediate", category: "big4_basics", statement: "유튜브는 콘텐츠를 직접 다 제작해야 하므로 자본이 매우 많이 드는 사업이다", answer: false, explanation: "창작자가 콘텐츠를 올리고 유튜브는 판을 제공해요. 이게 플랫폼의 자본 효율이에요.", insight: "남이 만든 가치로 돌아가는 플랫폼은 자본이 적게 들어요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "big4_basics", question: "광고 사업이 경기 침체에 상대적으로 민감한 이유는?", options: ["기업이 가장 먼저 줄이는 예산이 광고이기 때문", "광고는 법으로 금지되기 때문", "광고 단가가 고정되어 있기 때문", "광고에 세금이 없기 때문"], correctIndex: 0, explanation: "경기가 나쁠 때 광고 예산은 빨리 줄고, 회복하면 빨리 돌아와요. 순환은 있어도 구조는 남아요.", insight: "매출이 흔들려도 사업 구조가 남아 있으면 시간이 회복시켜 줍니다." },
  { format: "fill_blank", difficulty: "advanced", category: "big4_basics", sentence: "사용자가 늘수록 서비스 가치가 커지는 효과를 ___ 효과라고 한다.", answer: "네트워크", hints: ["네트워크"], explanation: "검색·유튜브·앱스토어 모두 네트워크 효과 위에 서 있어요.", insight: "네트워크 효과는 돈으로 살 수 없는 시간의 자산이에요." },

  // ---- Amazon ----
  { format: "ox", difficulty: "beginner", category: "big4_basics", statement: "아마존의 이익 대부분은 온라인 쇼핑이 아니라 클라우드(AWS)에서 나온 시기가 있었다", answer: true, explanation: "쇼핑은 매출이 크지만 이익률이 얇고, AWS는 매출 대비 이익이 훨씬 커요.", insight: "매출이 큰 사업과 돈을 버는 사업은 다를 수 있어요." },
  { format: "multiple_choice", difficulty: "beginner", category: "big4_basics", question: "아마존 프라임 회원제가 강력한 이유는?", options: ["연회비를 낸 고객이 더 자주, 더 많이 구매하기 때문", "회원이 광고를 봐야 하기 때문", "회원에게만 물건을 팔기 때문", "정부 지원 때문"], correctIndex: 0, explanation: "이미 낸 회비를 뽑으려는 심리가 반복 구매를 만들어요. 습관이 곧 해자죠.", insight: "구독은 고객의 습관을 계약으로 바꾸는 장치예요." },
  { format: "ox", difficulty: "intermediate", category: "big4_basics", statement: "아마존이 오랫동안 순이익이 적었던 것은 사업이 나빠서였다", answer: false, explanation: "벌어들인 현금을 물류·클라우드에 재투자했기 때문이에요. 회계 이익보다 현금흐름을 봐야 해요.", insight: "10계명 #9. 장부상 이익이 아니라 현금흐름이 진실이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "big4_basics", question: "아마존 물류망이 후발주자에게 어려운 벽인 이유는?", options: ["같은 규모를 만들려면 수십 년의 투자와 시간이 필요하기 때문", "물류는 법으로 독점이기 때문", "택배가 곧 사라질 사업이기 때문", "고객이 배송을 원하지 않기 때문"], correctIndex: 0, explanation: "돈만으로는 안 되고 시간까지 필요해요. 시간이 필요한 해자가 가장 단단합니다.", insight: "돈으로 못 사고 시간으로만 살 수 있는 것 — 그게 진짜 해자예요." },
  { format: "fill_blank", difficulty: "intermediate", category: "big4_basics", sentence: "회사가 실제로 손에 쥐는 돈, 즉 ___가 진실이다.", answer: "FCF", hints: ["FCF", "잉여현금흐름"], explanation: "10계명 #9. 통장에 꽂히는 돈이 진실이에요.", insight: "이익은 의견이고 현금은 사실입니다." },

  // ---- 공통: 4개 회사 왜 이들인가 ----
  { format: "multiple_choice", difficulty: "beginner", category: "big4_basics", question: "우리가 MSFT·GOOGL·AMZN·AAPL만 중심에 두는 이유는?", options: ["10년 뒤에도 사람들이 쓸 제품을 팔고, 이미 검증된 승자이기 때문", "최근 가장 많이 오른 종목이기 때문", "유튜버들이 추천했기 때문", "가격이 가장 싸기 때문"], correctIndex: 0, explanation: "10계명 #2. 미래 승자를 예측하지 않고, 검증된 승자와 함께 머물러요.", insight: "예측을 줄이면 불안도 줄어요." },
  { format: "ox", difficulty: "beginner", category: "big4_basics", statement: "테마주·코인·레버리지 ETF도 잘 고르면 우리 원칙 안에서 다룰 수 있다", answer: false, explanation: "우리 원칙은 화려한 신기술·복잡한 금융상품을 아예 다루지 않아요. 예외를 만들면 원칙이 아니에요.", insight: "원칙에 예외를 허용하는 순간, 그건 원칙이 아니라 기분이에요." },
  { format: "ox", difficulty: "intermediate", category: "big4_basics", statement: "초등학생에게 설명해서 이해되지 않는 사업은 나에게도 위험하다", answer: true, explanation: "능력의 원. 설명할 수 없다면 이해한 게 아니고, 이해하지 못하면 버틸 수 없어요.", insight: "설명할 수 없는 투자는 흔들릴 때 팔게 됩니다." },
  { format: "multiple_choice", difficulty: "intermediate", category: "big4_basics", question: "네 회사의 공통점으로 가장 정확한 것은?", options: ["매일 반복 사용되는 제품 + 높은 자본 효율 + 낮은 부채 부담", "최근 상장한 신생 기업", "정부가 보조금을 주는 기업", "배당수익률이 가장 높은 기업"], correctIndex: 0, explanation: "10계명 #3·#5·#6이 한 번에 겹치는 회사들이에요.", insight: "원칙 여러 개를 동시에 만족하는 회사가 드물게 좋은 회사예요." },
  { format: "fill_blank", difficulty: "beginner", category: "big4_basics", sentence: "우리는 10년 뒤에도 사람들이 쓸 제품을 파는 회사만 사고, 그리고 ___ 않는다.", answer: "팔지", hints: ["팔지"], explanation: "Buy & Hold Forever. 사는 것보다 안 파는 것이 어려워요.", insight: "결정은 한 번, 인내는 매일입니다." },
];
