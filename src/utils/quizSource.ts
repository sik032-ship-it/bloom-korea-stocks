// 퀴즈 해설의 출처·해설자 표기 — 해설 본문에 언급된 인물/자료를 근거로 출처를 표시한다.
const SOURCES: { match: RegExp; label: string }[] = [
  { match: /버핏/, label: "워런 버핏 (버크셔 해서웨이 주주서한·공개 발언, 의역)" },
  { match: /린치/, label: "피터 린치 (『월가의 영웅』 등 저서, 의역)" },
  { match: /멍거/, label: "찰리 멍거 (공개 강연·주총 발언, 의역)" },
  { match: /막스/, label: "하워드 막스 (오크트리 메모, 의역)" },
  { match: /탈레브/, label: "나심 탈레브 (『블랙 스완』·『안티프래질』, 의역)" },
  { match: /마코위츠/, label: "해리 마코위츠 (현대 포트폴리오 이론)" },
  { match: /카너먼|손실 회피|행동경제|행동재무/, label: "행동경제학 연구 (카너먼·트버스키 등)" },
  { match: /LTCM/, label: "LTCM 사태(1998) 공개 기록" },
];

export const QUIZ_EXPLAINER = "PPURI 콘텐츠팀 (교육용 해설)";

export function getQuizSources(text: string): string[] {
  const found = SOURCES.filter((s) => s.match.test(text)).map((s) => s.label);
  return found.length ? found : ["PPURI 자체 제작 (장기투자 행동 원칙 기반)"];
}

export const QUIZ_DISCLAIMER =
  "본 퀴즈와 해설은 장기투자 원칙 학습을 위한 교육용 콘텐츠이며, 특정 금융투자상품의 매수·매도 권유나 투자 자문이 아닙니다. 과거 사례와 인용은 미래 수익을 보장하지 않으며, 투자 판단과 결과의 책임은 본인에게 있습니다.";
