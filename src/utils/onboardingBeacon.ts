/**
 * Onboarding event delivery with sendBeacon + localStorage retry queue.
 *
 * Why: `supabase.from(...).insert(...)` returns a pending Promise that the
 * browser cancels mid-flight when the user closes the tab or navigates away.
 * We need three layers of resilience so the `onboarding_abandoned` /
 * `step_reached` / `onboarding_completed` events are never lost:
 *
 *   1) `sendEventBeacon(e)` — fire-and-forget during unload.
 *      Enqueues the event in localStorage FIRST, then uses
 *      `fetch(..., { keepalive: true })` (preferred — supports auth headers)
 *      with `navigator.sendBeacon` as a fallback.
 *
 *   2) `sendEventNow(e)` — normal in-app send. If the insert fails (network
 *      blip, transient 5xx), the event is queued for later retry.
 *
 *   3) `flushQueue()` — drains the localStorage queue on next app load.
 *      Bounded retry attempts so a permanently bad event won't loop forever.
 */
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const ENDPOINT = `${SUPABASE_URL}/rest/v1/onboarding_events`;
const QUEUE_KEY = "ppuri:onboarding_event_queue:v1";
const QUEUE_MAX = 50;
const MAX_RETRIES = 3;

export type OnboardingEventType =
  | "step_reached"
  | "onboarding_completed"
  | "onboarding_abandoned";

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface OnboardingEventPayload {
  user_id: string;
  step: number;
  event_type: OnboardingEventType;
  metadata?: Json | null;
}

interface QueuedEvent extends OnboardingEventPayload {
  _qid: string;
  _attempts: number;
  _ts: number;
}

// ---------- queue (localStorage) ----------

function readQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedEvent[]) {
  try {
    // bound the queue to avoid unbounded localStorage growth
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_MAX)));
  } catch {
    /* quota / disabled storage — drop silently */
  }
}

function enqueue(e: OnboardingEventPayload): string {
  const qid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const next = readQueue();
  next.push({ ...e, _qid: qid, _attempts: 0, _ts: Date.now() });
  writeQueue(next);
  return qid;
}

function removeFromQueue(ids: string[]) {
  if (ids.length === 0) return;
  const set = new Set(ids);
  writeQueue(readQueue().filter((e) => !set.has(e._qid)));
}

export function getQueueSize(): number {
  return readQueue().length;
}

// ---------- token resolution ----------

async function getAccessTokenAsync(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/** Synchronously read the access token from localStorage. Needed during
 *  `beforeunload` / `pagehide` where async/await is not safe. */
function getAccessTokenSync(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("sb-") || !k.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const token =
        parsed?.access_token ??
        parsed?.currentSession?.access_token ??
        null;
      if (typeof token === "string" && token.length > 0) return token;
    }
  } catch {
    /* ignore */
  }
  return null;
}

// ---------- send paths ----------

/** Fire-and-forget delivery suitable for tab-close / navigation away.
 *  Always enqueues first so any failure is retried on the next session. */
export function sendEventBeacon(e: OnboardingEventPayload): void {
  const qid = enqueue(e);
  const token = getAccessTokenSync();
  const body = JSON.stringify(e);

  // Preferred path: fetch + keepalive. Supports custom headers (apikey + Bearer),
  // and the browser keeps the request alive after the page is gone (up to 64KB).
  if (token && typeof fetch === "function") {
    try {
      fetch(ENDPOINT, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "return=minimal",
        },
        body,
      })
        .then((r) => {
          if (r.ok) removeFromQueue([qid]);
        })
        .catch(() => {
          /* leave in queue for next flush */
        });
      return;
    } catch {
      /* fall through to sendBeacon */
    }
  }

  // Fallback: navigator.sendBeacon. Note: it cannot set the Authorization
  // header, so PostgREST RLS will reject it — but we attempt anyway because
  // some Supabase configs accept the apikey via query string. Either way,
  // the event remains queued and will be retried on next load.
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(`${ENDPOINT}?apikey=${SUPABASE_KEY}`, blob);
    }
  } catch {
    /* swallow — already queued */
  }
}

/** Normal in-app send. On failure, the event is queued for later retry. */
export async function sendEventNow(e: OnboardingEventPayload): Promise<void> {
  try {
    const { error } = await supabase.from("onboarding_events").insert([e]);
    if (error) {
      console.warn("[onboarding_events] insert failed, queued for retry", error);
      enqueue(e);
    }
  } catch (err) {
    console.warn("[onboarding_events] insert threw, queued for retry", err);
    enqueue(e);
  }
}

/** Drain any queued events. Safe to call repeatedly. */
export async function flushQueue(): Promise<{ sent: number; remaining: number; dropped: number }> {
  const q = readQueue();
  if (q.length === 0) return { sent: 0, remaining: 0, dropped: 0 };

  const token = await getAccessTokenAsync();
  if (!token) return { sent: 0, remaining: q.length, dropped: 0 };

  let sent = 0;
  let dropped = 0;
  const keep: QueuedEvent[] = [];

  for (const item of q) {
    if (item._attempts >= MAX_RETRIES) {
      // Give up — avoids an infinite loop on a permanently-bad row.
      dropped += 1;
      continue;
    }
    const { _qid, _attempts, _ts, ...payload } = item;
    try {
      const { error } = await supabase.from("onboarding_events").insert(payload);
      if (error) {
        keep.push({ ...item, _attempts: item._attempts + 1 });
      } else {
        sent += 1;
      }
    } catch {
      keep.push({ ...item, _attempts: item._attempts + 1 });
    }
  }

  writeQueue(keep);
  return { sent, remaining: keep.length, dropped };
}
