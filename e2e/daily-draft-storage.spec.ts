import { test, expect, type Browser, type Page } from "@playwright/test";

/**
 * E2E: 데일리 문장 로컬 저장소의 스키마 마이그레이션 + 멀티탭 충돌 규칙.
 *
 * 로그인 없이 `/auth` 앱 셸을 띄우고 `dailyDraftStorage` 모듈을 브라우저
 * 컨텍스트에서 직접 import 해 검증한다. React 컴포넌트 없이도 storage 층의
 * 계약을 그대로 확인할 수 있다.
 */

const DRAFT_KEY = "ppuri:daily-sentence-draft";
const UNDO_KEY = "ppuri:daily-sentence-pending-undo";
const STORAGE_MODULE = "/src/utils/dailyDraftStorage.ts";

async function gotoApp(page: Page) {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.localStorage !== "undefined");
}

async function clearKeys(page: Page) {
  await page.evaluate(
    ({ d, u }) => {
      localStorage.removeItem(d);
      localStorage.removeItem(u);
    },
    { d: DRAFT_KEY, u: UNDO_KEY },
  );
}

async function openTwoTabs(browser: Browser) {
  const context = await browser.newContext();
  const a = await context.newPage();
  const b = await context.newPage();
  await gotoApp(a);
  await gotoApp(b);
  await clearKeys(a);
  return { context, a, b };
}

test.describe("dailyDraftStorage — schema versioning + migration", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await clearKeys(page);
  });

  test("v0 draft payload migrates to v1 envelope on next write", async ({ page }) => {
    // legacy bare shape: `{ticker: text}` (v0)
    await page.evaluate(
      (k) => localStorage.setItem(k, JSON.stringify({ AAPL: "hello", MSFT: "world" })),
      DRAFT_KEY,
    );

    const drafts = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readDrafts();
    }, STORAGE_MODULE);
    expect(drafts).toEqual({ AAPL: "hello", MSFT: "world" });

    // Re-write should upgrade to v1 envelope
    await page.evaluate(async (mod) => {
      const m = await import(mod);
      m.writeDrafts(m.readDrafts());
    }, STORAGE_MODULE);

    const raw = await page.evaluate((k) => localStorage.getItem(k), DRAFT_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.v).toBe(1);
    expect(parsed.drafts).toEqual({ AAPL: "hello", MSFT: "world" });
  });

  test("draft migration drops non-string entries (type mismatch)", async ({ page }) => {
    await page.evaluate(
      (k) =>
        localStorage.setItem(
          k,
          JSON.stringify({ AAPL: "ok", MSFT: 42, TSLA: null, NVDA: { nested: true } }),
        ),
      DRAFT_KEY,
    );
    const drafts = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readDrafts();
    }, STORAGE_MODULE);
    expect(drafts).toEqual({ AAPL: "ok" });
  });

  test("v0 pending-undo payload migrates and preserves origin", async ({ page }) => {
    const now = Date.now();
    await page.evaluate(
      ({ k, now }) =>
        localStorage.setItem(
          k,
          JSON.stringify({ ticker: "AAPL", text: "hi", submittedAt: now, origin: "old-tab" }),
        ),
      { k: UNDO_KEY, now },
    );
    const undo = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readPendingUndo();
    }, STORAGE_MODULE);
    expect(undo).toMatchObject({ ticker: "AAPL", text: "hi", origin: "old-tab" });
  });

  test("v0 pending-undo without origin gets marked as 'legacy'", async ({ page }) => {
    const now = Date.now();
    await page.evaluate(
      ({ k, now }) =>
        localStorage.setItem(k, JSON.stringify({ ticker: "AAPL", text: "hi", submittedAt: now })),
      { k: UNDO_KEY, now },
    );
    const undo = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readPendingUndo();
    }, STORAGE_MODULE);
    expect(undo?.origin).toBe("legacy");
  });

  test("garbage / wrong-shape payloads are ignored, not thrown", async ({ page }) => {
    await page.evaluate((k) => localStorage.setItem(k, "not json{{"), DRAFT_KEY);
    await page.evaluate((k) => localStorage.setItem(k, JSON.stringify(["a", "b"])), UNDO_KEY);
    const [drafts, undo] = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return [m.readDrafts(), m.readPendingUndo()];
    }, STORAGE_MODULE);
    expect(drafts).toEqual({});
    expect(undo).toBeNull();
  });

  test("expired pending-undo (>5s) is dropped on read", async ({ page }) => {
    await page.evaluate(
      ({ k, past }) =>
        localStorage.setItem(
          k,
          JSON.stringify({
            v: 1,
            undo: { ticker: "AAPL", text: "hi", submittedAt: past, origin: "t" },
          }),
        ),
      { k: UNDO_KEY, past: Date.now() - 10_000 },
    );
    const undo = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readPendingUndo();
    }, STORAGE_MODULE);
    expect(undo).toBeNull();
    const raw = await page.evaluate((k) => localStorage.getItem(k), UNDO_KEY);
    expect(raw).toBeNull();
  });
});

test.describe("dailyDraftStorage — multi-tab conflict rules", () => {
  test("newer submit in tab B overwrites older undo — tab A sees v1 envelope with B's origin", async ({
    browser,
  }) => {
    const { context, a, b } = await openTwoTabs(browser);

    // Record every pending-undo storage event on A
    await a.evaluate((k) => {
      (window as unknown as { __events: Array<{ newValue: string | null }> }).__events = [];
      window.addEventListener("storage", (e) => {
        if (e.key === k) {
          (window as unknown as { __events: Array<{ newValue: string | null }> }).__events.push({
            newValue: e.newValue,
          });
        }
      });
    }, UNDO_KEY);

    // A submits first
    await a.evaluate(async (mod) => {
      const m = await import(mod);
      m.writePendingUndo({
        ticker: "AAPL",
        text: "from A",
        submittedAt: Date.now(),
        origin: "tab-a",
      });
    }, STORAGE_MODULE);

    // B submits second (newer wins)
    await b.evaluate(async (mod) => {
      const m = await import(mod);
      m.writePendingUndo({
        ticker: "MSFT",
        text: "from B",
        submittedAt: Date.now() + 5,
        origin: "tab-b",
      });
    }, STORAGE_MODULE);

    // A observes B's storage event
    await a.waitForFunction(
      () =>
        (window as unknown as { __events: Array<{ newValue: string | null }> }).__events.some(
          (e) => e.newValue !== null,
        ),
      { timeout: 3000 },
    );
    const events = await a.evaluate(
      () => (window as unknown as { __events: Array<{ newValue: string | null }> }).__events,
    );
    const last = events[events.length - 1];
    expect(last.newValue).not.toBeNull();
    const parsed = JSON.parse(last.newValue!);
    expect(parsed.v).toBe(1);
    expect(parsed.undo.origin).toBe("tab-b");
    expect(parsed.undo.ticker).toBe("MSFT");

    await context.close();
  });

  test("undo cleared in tab A propagates as null-newValue storage event to tab B", async ({
    browser,
  }) => {
    const { context, a, b } = await openTwoTabs(browser);

    await b.evaluate((k) => {
      (window as unknown as { __cleared: boolean }).__cleared = false;
      window.addEventListener("storage", (e) => {
        if (e.key === k && !e.newValue) {
          (window as unknown as { __cleared: boolean }).__cleared = true;
        }
      });
    }, UNDO_KEY);

    await a.evaluate(async (mod) => {
      const m = await import(mod);
      m.writePendingUndo({
        ticker: "AAPL",
        text: "x",
        submittedAt: Date.now(),
        origin: "tab-a",
      });
      m.writePendingUndo(null); // 되돌리기 사용
    }, STORAGE_MODULE);

    await b.waitForFunction(
      () => (window as unknown as { __cleared: boolean }).__cleared === true,
      { timeout: 3000 },
    );
    await context.close();
  });

  test("draft indicator: tab A writes → tab B storage event carries v1 envelope readable by B", async ({
    browser,
  }) => {
    const { context, a, b } = await openTwoTabs(browser);

    await b.evaluate((k) => {
      (window as unknown as { __last: string | null }).__last = null;
      window.addEventListener("storage", (e) => {
        if (e.key === k) {
          (window as unknown as { __last: string | null }).__last = e.newValue;
        }
      });
    }, DRAFT_KEY);

    await a.evaluate(async (mod) => {
      const m = await import(mod);
      m.writeDrafts({ AAPL: "draft from A", MSFT: "second" });
    }, STORAGE_MODULE);

    await b.waitForFunction(
      () => (window as unknown as { __last: string | null }).__last !== null,
      { timeout: 3000 },
    );

    // B reads via the storage helper (migration-aware)
    const drafts = await b.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readDrafts();
    }, STORAGE_MODULE);
    expect(drafts).toEqual({ AAPL: "draft from A", MSFT: "second" });

    // The wire payload is a v1 envelope
    const raw = await b.evaluate(
      () => (window as unknown as { __last: string | null }).__last,
    );
    const parsed = JSON.parse(raw!);
    expect(parsed.v).toBe(1);
    expect(parsed.drafts.AAPL).toBe("draft from A");

    await context.close();
  });

  test("concurrent submits from A and B: last write wins, both tabs agree on final undo", async ({
    browser,
  }) => {
    const { context, a, b } = await openTwoTabs(browser);

    const t0 = await a.evaluate(() => Date.now());
    // A submits at t0, B submits at t0+10 → B wins
    await a.evaluate(
      async ({ mod, t }) => {
        const m = await import(mod);
        m.writePendingUndo({
          ticker: "AAPL",
          text: "a",
          submittedAt: t,
          origin: "tab-a",
        });
      },
      { mod: STORAGE_MODULE, t: t0 },
    );
    await b.evaluate(
      async ({ mod, t }) => {
        const m = await import(mod);
        m.writePendingUndo({
          ticker: "MSFT",
          text: "b",
          submittedAt: t,
          origin: "tab-b",
        });
      },
      { mod: STORAGE_MODULE, t: t0 + 10 },
    );

    // Give storage propagation a beat
    await a.waitForTimeout(50);

    const [undoA, undoB] = await Promise.all([
      a.evaluate(async (mod) => (await import(mod)).readPendingUndo(), STORAGE_MODULE),
      b.evaluate(async (mod) => (await import(mod)).readPendingUndo(), STORAGE_MODULE),
    ]);
    expect(undoA?.origin).toBe("tab-b");
    expect(undoB?.origin).toBe("tab-b");
    expect(undoA?.ticker).toBe("MSFT");
    expect(undoB?.ticker).toBe("MSFT");

    await context.close();
  });
});
