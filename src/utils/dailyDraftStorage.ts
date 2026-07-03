/**
 * 데일리 문장 로컬 저장소 — 스키마 버전 관리 + 마이그레이션.
 *
 * v0 (legacy):
 *   drafts   → `{ [ticker]: string }`
 *   undo     → `{ ticker, text, submittedAt, origin }`
 * v1 (current):
 *   drafts   → `{ v: 1, drafts: { [ticker]: string } }`
 *   undo     → `{ v: 1, undo: { ticker, text, submittedAt, origin } }`
 *
 * 마이그레이션은 read 시점에 수행하고, 다음 write 때 자동으로 최신 envelope 로
 * 올라간다. 이렇게 하면 여러 탭이 서로 다른 버전을 쓰더라도:
 *   - 최신 버전 리더는 legacy payload 를 정상 해석
 *   - legacy 리더는 v1 envelope 를 무시(잘못된 shape 로 판단)해 자기 초안만 유지
 * 결과적으로 배포 순간의 탭 충돌로 데이터가 훼손되지 않는다.
 */

export const DRAFT_KEY = "ppuri:daily-sentence-draft";
export const PENDING_UNDO_KEY = "ppuri:daily-sentence-pending-undo";
export const UNDO_WINDOW_MS = 5000;
export const SCHEMA_VERSION = 1;

export type DraftMap = Record<string, string>;
export type PendingUndo = {
  ticker: string;
  text: string;
  submittedAt: number;
  origin: string;
};

type DraftEnvelope = { v: number; drafts: DraftMap };
type UndoEnvelope = { v: number; undo: PendingUndo };

function migrateDrafts(raw: unknown): DraftMap {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  // v1 envelope
  if (
    typeof obj.v === "number" &&
    obj.drafts &&
    typeof obj.drafts === "object" &&
    !Array.isArray(obj.drafts)
  ) {
    const out: DraftMap = {};
    for (const [k, v] of Object.entries(obj.drafts as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }
  // v0: bare `{ticker: text}` — 타입 안 맞는 값은 조용히 버려 타입 불일치 방지
  const out: DraftMap = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function migrateUndo(raw: unknown): PendingUndo | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const candidate =
    typeof obj.v === "number" && obj.undo && typeof obj.undo === "object"
      ? (obj.undo as Record<string, unknown>)
      : obj;
  if (
    typeof candidate.ticker !== "string" ||
    typeof candidate.text !== "string" ||
    typeof candidate.submittedAt !== "number"
  ) {
    return null;
  }
  return {
    ticker: candidate.ticker,
    text: candidate.text,
    submittedAt: candidate.submittedAt,
    // 아주 오래된 v0 payload 는 origin 이 없을 수 있음 → "legacy" 로 표시해
    // 현재 탭 소유가 아니라는 사실을 명확히 남김
    origin: typeof candidate.origin === "string" ? candidate.origin : "legacy",
  };
}

export function readDrafts(): DraftMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return migrateDrafts(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function writeDrafts(drafts: DraftMap): boolean {
  try {
    const env: DraftEnvelope = { v: SCHEMA_VERSION, drafts };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

/** storage 이벤트의 newValue 처럼 raw 문자열만 있을 때 사용 */
export function parseDraftsRaw(raw: string | null): DraftMap {
  if (!raw) return {};
  try {
    return migrateDrafts(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function readPendingUndo(): PendingUndo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_UNDO_KEY);
    if (!raw) return null;
    const undo = migrateUndo(JSON.parse(raw));
    if (!undo) return null;
    if (Date.now() - undo.submittedAt > UNDO_WINDOW_MS) {
      window.localStorage.removeItem(PENDING_UNDO_KEY);
      return null;
    }
    return undo;
  } catch {
    return null;
  }
}

export function writePendingUndo(undo: PendingUndo | null): void {
  try {
    if (!undo) {
      window.localStorage.removeItem(PENDING_UNDO_KEY);
    } else {
      const env: UndoEnvelope = { v: SCHEMA_VERSION, undo };
      window.localStorage.setItem(PENDING_UNDO_KEY, JSON.stringify(env));
    }
  } catch {
    /* ignore */
  }
}

export function parsePendingUndoRaw(raw: string | null): PendingUndo | null {
  if (!raw) return null;
  try {
    return migrateUndo(JSON.parse(raw));
  } catch {
    return null;
  }
}
