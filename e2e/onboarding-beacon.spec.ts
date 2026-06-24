import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the onboarding beacon lifecycle:
 *  - visibilitychange(hidden)
 *  - pagehide
 *  - beforeunload + reload
 *  - queue flush after recovery
 *
 * We don't sign in. Instead we open a route that loads the app shell
 * (`/auth`) and drive the beacon utility directly via the page context so
 * the tests are deterministic and network-free.
 */

const QUEUE_KEY = "ppuri:onboarding_event_queue:v1";

type QueuedEvent = {
  user_id: string;
  step: number;
  event_type: string;
  metadata?: unknown;
  _qid: string;
  _attempts: number;
  _ts: number;
};

async function gotoApp(page: Page) {
  // Stub every onboarding_events request so the test never touches the real
  // backend. Returns 201 with empty body (matches `Prefer: return=minimal`).
  await page.route("**/rest/v1/onboarding_events**", (route) =>
    route.fulfill({ status: 201, body: "" }),
  );
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  // Wait until the React bundle has booted and localStorage is usable.
  await page.waitForFunction(() => typeof window.localStorage !== "undefined");
}

async function seedQueue(page: Page, events: Partial<QueuedEvent>[]) {
  await page.evaluate(
    ({ key, events }) => {
      const enriched = events.map((e, i) => ({
        user_id: e.user_id ?? "test-user",
        step: e.step ?? 1,
        event_type: e.event_type ?? "onboarding_abandoned",
        metadata: e.metadata ?? { test: true },
        _qid: e._qid ?? `q_test_${Date.now()}_${i}`,
        _attempts: e._attempts ?? 0,
        _ts: e._ts ?? Date.now(),
      }));
      localStorage.setItem(key, JSON.stringify(enriched));
    },
    { key: QUEUE_KEY, events },
  );
}

async function readQueue(page: Page): Promise<QueuedEvent[]> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  }, QUEUE_KEY);
}

test.describe("onboarding beacon lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate((key) => localStorage.removeItem(key), QUEUE_KEY);
  });

  test("queue survives visibilitychange → hidden", async ({ page }) => {
    await seedQueue(page, [{ event_type: "onboarding_abandoned", step: 3 }]);

    // Force the document into the hidden state and fire the event the way the
    // browser would when the user switches tabs / backgrounds a PWA.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const q = await readQueue(page);
    expect(q.length).toBe(1);
    expect(q[0].event_type).toBe("onboarding_abandoned");
    expect(q[0].step).toBe(3);
  });

  test("queue survives pagehide", async ({ page }) => {
    await seedQueue(page, [
      { event_type: "onboarding_abandoned", step: 2, _qid: "q_pagehide" },
    ]);

    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
    });

    const q = await readQueue(page);
    expect(q.find((e) => e._qid === "q_pagehide")).toBeTruthy();
  });

  test("queue survives full reload (beforeunload path)", async ({ page }) => {
    await seedQueue(page, [
      { event_type: "onboarding_abandoned", step: 5, _qid: "q_before" },
    ]);

    // Real navigation — this is what dispatches `beforeunload` / `pagehide`
    // for real and proves the queue persists across sessions.
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.localStorage !== "undefined");

    const q = await readQueue(page);
    expect(q.length).toBeGreaterThanOrEqual(1);
    expect(q.find((e) => e._qid === "q_before")).toBeTruthy();
  });

  test("flushQueue drains queued events when network recovers", async ({ page }) => {
    // Seed 3 events; route stub returns 201 so each insert should succeed.
    await seedQueue(page, [
      { _qid: "f1", step: 1 },
      { _qid: "f2", step: 2 },
      { _qid: "f3", step: 3 },
    ]);

    const result = await page.evaluate(async () => {
      const mod = await import("/src/utils/onboardingBeacon.ts");
      return mod.flushQueue();
    });

    expect(result.sent).toBe(3);
    expect(result.remaining).toBe(0);

    const q = await readQueue(page);
    expect(q.length).toBe(0);
  });

  test("failed flush re-queues with incremented attempts", async ({ page }) => {
    // Override the route to fail for this test only.
    await page.unroute("**/rest/v1/onboarding_events**");
    await page.route("**/rest/v1/onboarding_events**", (route) =>
      route.fulfill({ status: 500, body: '{"error":"boom"}' }),
    );

    await seedQueue(page, [{ _qid: "retry1", step: 1, _attempts: 0 }]);

    const result = await page.evaluate(async () => {
      const mod = await import("/src/utils/onboardingBeacon.ts");
      return mod.flushQueue();
    });

    expect(result.sent).toBe(0);
    expect(result.remaining).toBe(1);

    const q = await readQueue(page);
    expect(q[0]._attempts).toBeGreaterThanOrEqual(1);
  });
});
