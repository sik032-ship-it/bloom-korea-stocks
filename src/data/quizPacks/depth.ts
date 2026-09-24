// 콘텐츠 심화 팩 — 주제별 얇은 구간 보강 (2026-09)
// 바닥 예측 금지 · 어디에 머무를지 · 겸손 · 브랜드 해자 · 현금흐름 · 미국시장 · 위기
import type { QuizQuestion } from "@/data/quizTypes";

// ===== 바닥 예측 금지 (3/3/3) =====
const depthNoBottomFishing: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "no_bottom_fishing", statement: "주식이 50% 떨어졌으니 바닥이고, 지금이 최저가 매수 기회다", answer: false, explanation: "바닥은 지나고 나서만 알 수 있어요. 50% 떨어진 주식이 다시 50% 더 떨어질 수 있습니다 — 2000년 버블 때 많은 기술주가 그랬어요.", insight: "바닥을 맞추는 사람이 아니라, 좋은 회사를 견디는 사람이 이겨요." },
  { format: "multiple_choice", difficulty: "beginner", category: "no_bottom_fishing", question: "'바닥 잡기(bottom fishing)'의 가장 큰 위험은?", options: ["떨어지는 이유를 모른 채 사는 것", "수수료가 비싼 것", "배당이 없는 것", "세금이 많이 드는 것"], correctIndex: 0, explanation: "가격만 보고 사면, 기업이 무너지는 이유를 모른 채 떨어지는 칼을 잡는 셈이에요.", insight: "싸 보이는 건 항상 '그때까지의 가격'과 비교한 것일 뿐이에요." },
  { format: "fill_blank", difficulty: "beginner", category: "no_bottom_fishing", sentence: "하락 추세에서 투자자들 사이에 도는 격언: '떨어지는 ___은 잡지 마라'", answer: "칼", hints: ["칼", "나이프"], explanation: "바닥을 확인하기 전까지 떨어지는 주식은 계속 떨어질 수 있어요. 손을 뻗으면 손가락부터 다칩니다.", insight: "기회는 바닥이 확인된 뒤에도 남아 있어요. 서두를 이유가 없어요." },
  { format: "ox", difficulty: "intermediate", category: "no_bottom_fishing", statement: "1년 만에 70% 떨어진 주식은 70% 싸졌으므로 무조건 사 둘 때다", answer: false, explanation: "가격이 70% 내려갔어도 기업 가치가 90% 무너졌을 수 있어요. 싸 보이는 건 과거 가격과의 비교일 뿐, 현재 가치와의 비교가 아니에요.", insight: "'예전 가격의 몇 할'이 아니라 '지금 가치 대비 얼마'를 물어야 해요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "no_bottom_fishing", question: "급락장에서 바닥 예측 대신 해야 할 일은?", options: ["기업의 펀더멘털이 변했는지 확인", "차트에 바닥선 그리기", "레버리지로 물타기", "커뮤니티 의견 따라가기"], correctIndex: 0, explanation: "가격의 문제가 아니라 사업의 문제인지부터 봐야 해요. 사업이 그대로라면 급락은 소음일 수 있어요.", insight: "차트는 과거를 그려주고, 펀더멘털은 미래를 말해줘요." },
  { format: "ox", difficulty: "intermediate", category: "no_bottom_fishing", statement: "물타기(평단 조정)는 손실 종목에서 항상 올바른 전략이다", answer: false, explanation: "기업 가치가 그대로인 게 확인됐다면 근거 있는 추가 매수예요. 하지만 떨어지는 이유가 사업 무너짐이라면 투입한 돈만 늘어나는 손실이죠.", insight: "물타기의 근거는 '더 싸졌다'가 아니라 '여전히 좋다'여야 해요." },
  { format: "ox", difficulty: "advanced", category: "no_bottom_fishing", statement: "2000년 IT버블 당시 '바닥은 충분히 왔다'며 시스코를 매수한 투자자는 20년 가까이 손실을 안았다", answer: true, explanation: "시스코는 2000년 3월 최고점 이후 90% 가까이 떨어졌고, 최고가를 회복하는 데 약 20년이 걸렸어요. '한 번의 바닥 판단'이 세대급 손실이 됐습니다.", insight: "바닥 판단을 한 번 틀리면, 그 시간은 평생 투자 시간에서 빠져나가요." },
  { format: "multiple_choice", difficulty: "advanced", category: "no_bottom_fishing", question: "'폭락한 우량주'와 '싸지는 쓰레기주'를 가르는 기준은?", options: ["사업의 근본 가치(현금흐름·해자)가 유지되는가", "하락 폭이 얼마나 큰가", "거래량이 얼마나 많은가", "최고가 대비 몇 % 할인됐는가"], correctIndex: 0, explanation: "같은 -80%라도 해자가 남은 회사는 시간이 가격을 회복시키고, 사업이 무너진 회사는 회복이 없어요.", insight: "하락 폭은 기회의 크기가 아니라, 사업 상태가 기회의 본질이에요." },
  { format: "fill_blank", difficulty: "advanced", category: "no_bottom_fishing", sentence: "가격이 아무리 싸 보여도 사업이 무너졌다면 그것은 기회가 아니라 ___이다", answer: "함정", hints: ["함정", "덫"], explanation: "싸게 보이는 가격 자체가 유혹일 때, 그 뒤에 숨은 이유를 확인하지 않으면 덫에 걸려요.", insight: "'왜 이렇게 싸졌지?'라는 질문에 답할 수 없으면 사지 마세요." },
];

// ===== 어디에 머무를지 (2/3/2) =====
const depthWhereNotWhen: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "where_not_when", statement: "좋은 회사를 샀다면 팔 타이밍을 미리 정해두는 것이 안전하다", answer: false, explanation: "'1년 지나면 팔자' 같은 시간 기준 매도는 좋은 복리를 끊어요. 판단 기준은 시간이 아니라 기업 자체의 변화예요.", insight: "팔지 말지는 달력이 아니라 기업이 결정하게 하세요." },
  { format: "ox", difficulty: "beginner", category: "where_not_when", statement: "10년 뒤에도 사람들이 쓸 제품을 파는 회사는 타이밍보다 머무름이 중요하다", answer: true, explanation: "그런 회사는 시간이 지날수록 가치가 쌓여요. 그래서 진짜 수익은 '언제 샸냐'가 아니라 '얼마나 오래 있었냐'에서 나옵니다.", insight: "머무는 동안 복리는 조용히 일해요." },
  { format: "multiple_choice", difficulty: "beginner", category: "where_not_when", question: "매수 후 가장 자주 확인해야 할 것은?", options: ["기업이 여전히 좋은 기업인지", "오늘의 주가", "환율", "연준 회의 일정"], correctIndex: 0, explanation: "주가·환율·뉴스는 소음이에요. 사업이 여전히 건강한지만 꾸준히 봐도 충분합니다.", insight: "확인 주기가 짧아질수록, 결정은 나빠져요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "where_not_when", question: "장기 투자에서 '장중'보다 '장기'가 유리한 대표 통계는?", options: ["시장 최고 상승일 며칠만 놓쳐도 누적 수익률이 크게 줄어든다", "매매할수록 수수료 수익이 쌓인다", "단기 매도가 세금을 줄여준다", "휴장일에는 이자가 붙는다"], correctIndex: 0, explanation: "최근 수십 년간 최고 상승일 상위 10일만 놓쳐도 수익률이 절반 이하로 떨어져요. 그 상승일은 대부분 공포가 가득한 날에 옵니다.", insight: "장에 계속 있어야 최고의 날을 함께 받아요. 타이밍은 그 날을 피하게 만들죠." },
  { format: "multiple_choice", difficulty: "intermediate", category: "where_not_when", question: "'이제 팔아야 하나' 고민이 시작되면 가장 먼저 점검할 것은?", options: ["내가 산 이유(논거)가 사라졌는지", "이번 달 주가 등락률", "친구들의 수익률", "뉴스 분위기"], correctIndex: 0, explanation: "산 이유가 그대로면 팔 이유도 없어요. 논거가 무너졌을 때만 매도를 검토하세요.", insight: "매수 기록을 남긴 사람만, 매도 판단도 깔끔하게 내릴 수 있어요." },
  { format: "fill_blank", difficulty: "intermediate", category: "where_not_when", sentence: "좋은 기업을 팔아야 할 이유는 가격이 아니라 ___의 변화다", answer: "사업", hints: ["사업", "펀더멘털"], explanation: "가격 하락은 사업 문제가 아닐 수 있어요. 사업 자체가 무너졌을 때만 판단이 서야 합니다.", insight: "가격은 매일 변하고, 사업은 천천히 변해요. 천천히 변하는 것을 보세요." },
  { format: "ox", difficulty: "advanced", category: "where_not_when", statement: "1987년 10월 19일 미국 증시가 하루 만에 약 22% 폭락했지만, 좋은 기업을 들고 있었다면 시간이 문제를 해결했다", answer: true, explanation: "블랙 먼데이(-22.6%)는 역사상 가장 큰 하루 폭락이었지만, 시장은 약 2년 만에 회복했어요. 그날 매도한 사람이 진짜 손실을 확정했죠.", insight: "하루의 충격과 10년의 결과는 다른 세계예요." },
  { format: "ox", difficulty: "advanced", category: "where_not_when", statement: "'지금은 위험하니 현금으로 있다가 바닥에 다시 사겠다'는 전략은 장기 누적 수익률에서 대부분 실패한다", answer: false, explanation: "질문을 되돌려 보세요 — 이 문장은 '사실이다'가 정답이에요. 매수를 미룬 기간에 시장은 오르고, 재진입 타이밍은 계속 놓칩니다. 연구마다 현금 대기 전략이 장기 수익률을 낮춘다고 나와요.", insight: "바닥에 다시 사겠다는 사람 중 바닥에 다시 산 사람은 거의 없어요." },
];

// ===== 겸손·능력의 원 (2/2/3) =====
const depthHumility: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "humility", statement: "내가 매일 쓰는 회사의 제품이라면 아무리 비싸도 사도 된다", answer: false, explanation: "제품을 안다는 건 능력의 원 안에 있다는 힌트일 뿐이에요. 가격까지 이해해야 투자도 원 안에 있습니다.", insight: "좋아하는 제품과 좋은 투자 사이에는 가격 판단이 있어요." },
  { format: "multiple_choice", difficulty: "beginner", category: "humility", question: "'능력의 원(circle of competence)'이란?", options: ["내가 진짜로 이해하는 사업의 범위", "내가 가진 돈의 범위", "내 계좌에 담을 수 있는 종목 수", "내가 살 수 있는 주식의 종류"], correctIndex: 0, explanation: "버핏: '원의 크기가 중요하지 않다. 경계를 정확히 아는 것이 중요하다.'", insight: "모르는 것을 사지 않는 것만으로도 실수의 절반이 사라져요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "humility", question: "모르는 것에 투자했을 때 가장 흔한 결과는?", options: ["떨어져도 이유를 몰라 불안에 손절한다", "항상 큰 수익이 난다", "세금이 줄어든다", "변동성이 줄어든다"], correctIndex: 0, explanation: "이해가 없으면 하락이 '기회'가 아니라 '재난'으로 보여요. 그래서 최악의 타이밍에 팔게 됩니다.", insight: "이유를 말할 수 없는 종목은 하락장에서 가장 먼저 내려놓게 돼요." },
  { format: "ox", difficulty: "intermediate", category: "humility", statement: "'이번엔 다르다'는 말은 투자 역사에서 가장 비싼 네 글자다", answer: true, explanation: "2000년 닷컴버블, 2008년 금융위기 — 매번 '이번엔 다르다'며 규칙을 깬 사람들이 가장 크게 잃었어요.", insight: "역사는 반복되지 않지만, 인간의 실수는 반복돼요." },
  { format: "ox", difficulty: "advanced", category: "humility", statement: "버핏은 1990년대 닷컴 열풍 때 '이해하지 못한다'며 참았고, 그 덕에 2000년 버블 붕괴의 직격탄을 피했다", answer: true, explanation: "당시 버핏은 '놓친 기회'로 조롱을 받았어요. 하지만 버블이 터지자 참았던 것이 최고의 방어였습니다.", insight: "겸손한 결정은 당장은 답답해도, 큰 폭풍에서 살아남아요." },
  { format: "multiple_choice", difficulty: "advanced", category: "humility", question: "능력의 원을 건전하게 넓히는 방법은?", options: ["한 회사의 사업 구조를 깊게 공부해 이해를 확장", "종목을 많이 사서 경험으로 배운다", "경제 뉴스를 하루 몇 시간씩 본다", "전문가 추천 종목을 따라간다"], correctIndex: 0, explanation: "원은 '아는 것'으로 넓어지지 '가진 것'으로는 넓어지지 않아요. 깊이가 넓이를 만듭니다.", insight: "10개 회사를 겉핥기보다 1개 회사를 파는 게 원을 키워요." },
  { format: "fill_blank", difficulty: "advanced", category: "humility", sentence: "겸손한 투자자의 문장: '내가 모르는 것을 ___ 하는 것이 지혜다'", answer: "인정", hints: ["인정", "알아차림"], explanation: "모르는 것을 인정하는 순간, 위험한 투자를 건너뛸 수 있어요. 아는 척이 가장 비싼 실수입니다.", insight: "'모릅니다'라고 말할 수 있는 사람이 계좌를 지켜요." },
];

// ===== 브랜드 해자 (1/3/3) =====
const depthBrandMoat: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "brand_moat", statement: "해자가 깊은 회사는 경쟁자가 나타나도 가격 결정력을 지킬 수 있다", answer: false, explanation: "질문을 뒤집어 보세요 — 이 문장은 '사실이다'가 정답이에요. 해자란 경쟁자가 뛰어넘기 어려운 보호막이라, 회사가 가격을 스스로 정할 수 있게 해줍니다.", insight: "가격을 누가 정하는지 물어보면 해자가 보여요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "brand_moat", question: "다음 중 '가짜 해자'에 가까운 것은?", options: ["이름에 유행하는 신기술 키워드를 붙인 것", "수십 년간 쌓인 브랜드 신뢰", "전환 비용이 큰 구독 서비스", "독점적으로 쌓인 데이터"], correctIndex: 0, explanation: "키워드는 경쟁자도 하루 만에 붙일 수 있어요. 해자는 시간과 구조로만 만들어집니다.", insight: "말로 만든 해자는 물에 녹아요." },
  { format: "fill_blank", difficulty: "intermediate", category: "brand_moat", sentence: "돈으로 살 수 있는 설비는 해자가 아니다. 살 수 없는 ___만 해자다", answer: "브랜드", hints: ["브랜드", "신뢰"], explanation: "공장·기계는 경쟁자도 돈으로 살 수 있어요. 고객의 신뢰와 습관만이 살 수 없는 자산입니다.", insight: "구매하려면 몇 년, 신뢰되려면 몇십 년." },
  { format: "multiple_choice", difficulty: "advanced", category: "brand_moat", question: "네트워크 효과 해자의 핵심은?", options: ["사용자가 늘수록 제품 가치가 커져 후발주자가 따라잡기 어렵다", "공장이 많아 생산력이 크다", "광고비를 많이 쓸 수 있다", "정부 규제 덕분에 보호받는다"], correctIndex: 0, explanation: "사용자 수가 곧 제품 품질인 사업이에요. 후발주자는 더 좋은 제품을 만들어도 사용자가 없으면 이길 수 없죠.", insight: "쓰면 쓸수록 좋아지는 제품이 가장 오래 삽니다." },
  { format: "multiple_choice", difficulty: "advanced", category: "brand_moat", question: "구글 검색의 해자를 가장 정확히 설명한 것은?", options: ["검색이 많아질수록 결과가 정교해지는 데이터 루프", "무료로 제공되어서", "화면 디자인이 단순해서", "광고 단가가 싸서"], correctIndex: 0, explanation: "검색량이 데이터가 되고, 데이터가 품질을 높이고, 품질이 다시 검색량을 부르는 선순환이에요. 이 루프는 돈으로 복제할 수 없어요.", insight: "경쟁자가 '돈으로 살 수 없는' 것을 찾으세요. 그것이 해자예요." },
  { format: "ox", difficulty: "advanced", category: "brand_moat", statement: "해자의 진짜 시험은 호황이 아니라 불황이다 — 위기 때 경쟁자는 사라지고 깊은 해자는 더 깊어진다", answer: true, explanation: "불황에 약한 사업은 정리되고, 현금흐름이 튼튼한 해자 기업은 점유율과 인재까지 흡수해요. 위기는 해자의 레벨업 시간입니다.", insight: "폭풍은 강한 나무에게 햇빛을 남겨줘요." },
  { format: "multiple_choice", difficulty: "advanced", category: "brand_moat", question: "해자가 깊은 회사의 재무제표에 남는 흔적은?", options: ["경기가 흔들려도 이익률이 잘 무너지지 않는다", "매출이 항상 2배씩 늘어난다", "부채가 항상 0이다", "배당이 항상 오른다"], correctIndex: 0, explanation: "가격 결정력은 위기에도 이익률을 지켜요. 호황 때 이익률은 다들 좋아 보이니, 불황 때의 이익률이 해자의 증거입니다.", insight: "불황 기록의 이익률이 그 회사의 진짜 체급이에요." },
];

// ===== 현금흐름이 진실 (1/2/2) =====
const depthCashFlow: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "cash_flow", statement: "매출이 늘어나는 회사는 반드시 현금도 늘어난다", answer: false, explanation: "아직 돈을 못 받은 외상 판매도 매출로 인정돼요. 그래서 매출은 커지는데 통장은 텅 빈 회사가 존재합니다.", insight: "매출은 장부의 말이고, 현금은 통장의 말이에요. 통장을 믿으세요." },
  { format: "fill_blank", difficulty: "beginner", category: "cash_flow", sentence: "투자 격언: '이익은 의견이지만 ___은 사실이다'", answer: "현금흐름", hints: ["현금흐름", "캐시플로우"], explanation: "이익은 회계 규칙에 따라 달라질 수 있지만, 실제로 들어오고 나가는 현금은 조작이 어려워요.", insight: "숫자가 좋아 보일수록 현금흐름표를 먼저 펴세요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "cash_flow", question: "애저·아이클라우드 같은 구독 사업이 투자자에게 좋은 이유는?", options: ["매달 현금이 미리 들어와 미래를 예측하기 쉽다", "주가가 항상 오르기 때문", "경쟁자가 없기 때문", "세금이 없기 때문"], correctIndex: 0, explanation: "구독은 1년치 계약금을 미리 받는 경우도 있어요. 들어오는 현금의 타이밍과 크기가 안정적이면 회사의 미래도 안정적입니다.", insight: "매달 반복되는 결제는 회사에게 심박수예요." },
  { format: "ox", difficulty: "intermediate", category: "cash_flow", statement: "자유현금흐름(FCF)이 많은 회사는 자사주 매입·배당 등으로 주주에게 돈을 돌려줄 여력이 크다", answer: true, explanation: "사업을 유지·성장시키고 남은 진짜 현금이 FCF예요. 애플이 수조 원대 자사주 매입을 할 수 있는 이유죠.", insight: "주주에게 돌려줄 수 있는 돈만이 진짜 번 돈이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "cash_flow", question: "매출 성장률이 화려해도 위험한 신호는?", options: ["현금흐름은 마이너스인데 매출만 늘어난다", "이익률이 높다", "현금이 꾸준히 쌓인다", "부채가 줄어든다"], correctIndex: 0, explanation: "'규모를 키우려고 돈을 깔아주는' 성장은 언젠가 기름이 떨어지면 멈춰요. 성장의 질은 현금이 따라오는지로 판단합니다.", insight: "성장 속도보다, 그 성장이 현금을 벌고 있는지가 중요해요." },
];

// ===== 미국주식·매크로 (2/1/2) =====
const depthUsMarket: QuizQuestion[] = [
  { format: "ox", difficulty: "beginner", category: "us_market", statement: "미국 주식은 달러 자산이라, 환율이 오르면 원화 기준 수익이 추가로 커질 수 있다", answer: true, explanation: "같은 달러 수익이라도 원화가 약세면 환전할 때 더 큰 원화로 돌아와요. 반대로 원화가 강세면 환차손이 날 수도 있죠.", insight: "미국주식 투자는 주식 + 환율 두 가지를 함께 듣는 거예요." },
  { format: "multiple_choice", difficulty: "beginner", category: "us_market", question: "S&P 500 지수는 무엇을 담고 있나요?", options: ["미국 대형 500개 기업", "미국에 상장된 전체 기업", "나스닥 기술주만", "세계 전체 기업"], correctIndex: 0, explanation: "미국 시가총액 상위 대형 500개 기업으로 미국 경제의 큰 그림을 보여줘요.", insight: "지수를 알면 뉴스 속 숫자가 이야기로 들려요." },
  { format: "ox", difficulty: "intermediate", category: "us_market", statement: "미국 물가지수(CPI) 발표가 예상보다 높게 나오면 주식 시장은 대체로 그 소식을 환영한다", answer: false, explanation: "물가가 예상보다 뜨거우면 연준의 금리 인상 압력이 커져요. 높은 금리는 미래 현금흐름의 가치를 깎아 내려 주가에 부담입니다.", insight: "시장은 좋은 소식이 아니라 '예상과의 차이'에 반응해요." },
  { format: "ox", difficulty: "advanced", category: "us_market", statement: "지난 100년간 미국 주식은 1~2년 단위로 폭락도 자주 있었지만, 20년 보유 기준으로는 물가를 이기지 못한 적이 없다", answer: true, explanation: "대공황·스태그플레이션·금융위기조차 20년 실질(물가 반영) 수익률은 플러스였어요. 리스크는 시간이 길어질수록 줄어듭니다.", insight: "주식의 위험은 '사는 것'이 아니라 '짧게 가지는 것'이에요." },
  { format: "multiple_choice", difficulty: "advanced", category: "us_market", question: "금리 인상기에 성장주(기술주)가 상대적으로 힘든 핵심 이유는?", options: ["멀리 있는 미래 현금흐름의 현재가치가 줄어들기 때문", "기술주는 금리와 아예 무관해서", "금리 인상기에는 소비가 늘어나서", "달러가 항상 약세지기 때문"], correctIndex: 0, explanation: "10년 뒤의 큰 이익도 금리가 오르면 '지금 가치'로 환산했을 때 작아져요. 미래를 많이 담은 성장주가 그 영향을 크게 받죠.", insight: "금리는 미래를 지금으로 끌어오는 환율이에요." },
];

// ===== 위기 대처 — 중급 보강 (3) =====
const depthCrisis: QuizQuestion[] = [
  { format: "ox", difficulty: "intermediate", category: "crisis", statement: "위기 때 뉴스를 끄고 내 투자 원칙을 다시 읽는 것은 도피가 아니라 전략이다", answer: false, explanation: "질문을 뒤집어 보세요 — '사실이다'가 정답이에요. 위기 때 뉴스는 공포를 증폭시켜 판단을 흐려요. 원칙은 흔들린 마음을 붙잡아 주는 앵커입니다.", insight: "폭풍 속에서 붙잡을 건 등대(원칙)지, 파도(뉴스)가 아니에요." },
  { format: "multiple_choice", difficulty: "intermediate", category: "crisis", question: "내 종목이 하루 만에 -8% 급락했다. 첫 행동으로 가장 나은 것은?", options: ["회사가 변했는지 점검한다 — 팔 이유가 생겼나?", "즉시 전량 매도해 더 큰 손실을 막는다", "레버리지로 더 사서 평단을 낮춘다", "차트의 지지선을 확인해 본다"], correctIndex: 0, explanation: "가격의 급락과 사업의 급락은 다른 일이에요. 회사가 그대로라면 소음, 사업이 무너졌다면 그때가 판단 시점입니다.", insight: "급락장의 첫 질문은 '얼마나 떨어졌나'가 아니라 '무엇이 변했나'예요." },
  { format: "fill_blank", difficulty: "intermediate", category: "crisis", sentence: "버핏: '물이 빠지면 누가 ___ 수영을 했는지 드러난다'", answer: "알몸으로", hints: ["알몸으로", "벗은 채"], explanation: "호황 때는 레버리지와 무모한 투자도 잘 되는 것처럼 보여요. 위기가 와야 누가 근거 없이 헤엄쳤는지 드러납니다.", insight: "위기는 실력을 만들지 않아요. 숨겨둔 무지를 보여줄 뿐이에요." },
];

export const depthPackQuestions: QuizQuestion[] = [
  ...depthNoBottomFishing,
  ...depthWhereNotWhen,
  ...depthHumility,
  ...depthBrandMoat,
  ...depthCashFlow,
  ...depthUsMarket,
  ...depthCrisis,
];
