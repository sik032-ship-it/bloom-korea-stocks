// 최근 출제 이력 (localStorage) — 14일 내 중복 출제 방지
// 스키마 변경 없이 클라이언트에서만 관리. 실패 시 조용히 폴백.

const KEY = "ppuri:quiz-history";
const WINDOW_DAYS = 14;
const SCHEMA_VERSION = 1;

interface HistoryEntry {
  k: string; // question key
  t: number; // served timestamp (ms)
}
interface HistoryPayload {
  v: number;
  entries: HistoryEntry[];
}

function safeRead(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    // v0 legacy: 그냥 배열이었던 경우 → 승격
    if (Array.isArray(parsed)) {
      return parsed
        .filter((e) => e && typeof e.k === "string" && typeof e.t === "number")
        .map((e) => ({ k: e.k, t: e.t }));
    }
    const payload = parsed as HistoryPayload;
    if (payload.v !== SCHEMA_VERSION || !Array.isArray(payload.entries)) return [];
    return payload.entries.filter((e) => e && typeof e.k === "string" && typeof e.t === "number");
  } catch {
    return [];
  }
}

function safeWrite(entries: HistoryEntry[]): boolean {
  try {
    const payload: HistoryPayload = { v: SCHEMA_VERSION, entries };
    localStorage.setItem(KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function withinWindow(entries: HistoryEntry[]): HistoryEntry[] {
  const cutoff = Date.now() - WINDOW_DAYS * 86400000;
  return entries.filter((e) => e.t >= cutoff);
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 최근 14일 내(오늘 제외) 출제된 문항 키 집합 — 오늘 기록은 제외해야 새로고침해도 같은 세트 */
export function getRecentQuestionKeys(): Set<string> {
  const today = startOfToday();
  return new Set(withinWindow(safeRead()).filter((e) => e.t < today).map((e) => e.k));
}

// ── 오늘의 세트 고정 캐시 ──
const DAILY_KEY = "ppuri:quiz-daily-set";
interface DailySetPayload { v: 1; day: string; user: string; count: number; keys: string[] }

export function readDailySet(day: string, user: string, count: number): string[] | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as DailySetPayload;
    if (p?.v !== 1 || p.day !== day || p.user !== user || p.count !== count || !Array.isArray(p.keys)) return null;
    return p.keys.filter((k) => typeof k === "string");
  } catch {
    return null;
  }
}

export function writeDailySet(day: string, user: string, count: number, keys: string[]): void {
  try {
    const p: DailySetPayload = { v: 1, day, user, count, keys };
    localStorage.setItem(DAILY_KEY, JSON.stringify(p));
  } catch {
    // 조용히 폴백
  }
}

/** 오늘 출제한 문항을 이력에 기록 */
export function recordServedQuestions(keys: string[]): boolean {
  if (keys.length === 0) return true;
  const now = Date.now();
  const existing = withinWindow(safeRead());
  const seen = new Set(existing.map((e) => e.k));
  const merged = [...existing];
  keys.forEach((k) => {
    if (!seen.has(k)) merged.push({ k, t: now });
  });
  return safeWrite(merged);
}

export function clearQuizHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 조용히 무시
  }
}
