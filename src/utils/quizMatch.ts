// 빈칸 채우기 정답 비교 - 한국어 친화적 정규화
// - 양끝 공백 제거
// - 모든 공백/구두점 제거 ("리스크 관리" === "리스크관리", "리스크-관리")
// - 소문자화
// - 한국어 흔한 조사 꼬리("을","를","이","가","은","는","의","에","으로","로") 제거
const PARTICLES = ["으로", "로", "을", "를", "이", "가", "은", "는", "의", "에", "도", "만"];

export function normalizeAnswer(s: string): string {
  if (!s) return "";
  let v = s.trim().toLowerCase();
  // 모든 공백 + 일반 구두점 제거
  v = v.replace(/[\s.,!?'"`~()\[\]{}\-_/\\·•・]/g, "");
  // 끝 조사 1개 제거 (가장 긴 것 우선). 남는 어간이 1자 이상이면 잘라냄.
  const sorted = [...PARTICLES].sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (v.endsWith(p) && v.length - p.length >= 1) {
      v = v.slice(0, -p.length);
      break;
    }
  }
  return v;
}

export function isAnswerCorrect(userInput: string, answer: string, hints?: string[]): boolean {
  const ni = normalizeAnswer(userInput);
  if (!ni) return false;
  const candidates = [answer, ...(hints || [])].map(normalizeAnswer);
  return candidates.includes(ni);
}
