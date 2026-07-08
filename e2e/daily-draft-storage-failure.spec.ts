import { test, expect, type Page } from "@playwright/test";

/**
 * E2E: localStorage 실패(프라이빗 모드 / 쿼터 초과) 시 draft & pending undo 가
 * 예외 없이 조용히 폴백하는지 검증한다.
 *
 * - getItem 이 throw → read* 는 {} / null 을 반환
 * - setItem 이 throw → write* 는 예외 없이 무시(writeDrafts 는 false)
 * - 이후 정상 복구된 세션에서 새 데이터를 다시 쓸 수 있어야 함
 */

const DRAFT_KEY = "ppuri:daily-sentence-draft";
const UNDO_KEY = "ppuri:daily-sentence-pending-undo";
const STORAGE_MODULE = "/src/utils/dailyDraftStorage.ts";

async function gotoApp(page: Page) {
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.localStorage !== "undefined");
  await page.evaluate(
    ({ d, u }) => {
      try {
        localStorage.removeItem(d);
        localStorage.removeItem(u);
      } catch {
        /* ignore */
      }
    },
    { d: DRAFT_KEY, u: UNDO_KEY },
  );
}

/**
 * localStorage 의 setItem/getItem 을 지정된 mode 로 교체한다.
 *   - "throw-set": setItem 만 QuotaExceededError 던짐 (쿼터 초과)
 *   - "throw-all": setItem/getItem 모두 SecurityError 던짐 (프라이빗 모드 유사)
 */
async function breakLocalStorage(page: Page, mode: "throw-set" | "throw-all") {
  await page.evaluate((m) => {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    const w = window as unknown as {
      __origSet?: typeof proto.setItem;
      __origGet?: typeof proto.getItem;
    };
    w.__origSet = proto.setItem;
    w.__origGet = proto.getItem;
    proto.setItem = function () {
      const err = new Error("QuotaExceededError");
      err.name = "QuotaExceededError";
      throw err;
    };
    if (m === "throw-all") {
      proto.getItem = function () {
        const err = new Error("SecurityError");
        err.name = "SecurityError";
        throw err;
      };
    }
  }, mode);
}

async function restoreLocalStorage(page: Page) {
  await page.evaluate(() => {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    const w = window as unknown as {
      __origSet?: typeof proto.setItem;
      __origGet?: typeof proto.getItem;
    };
    if (w.__origSet) proto.setItem = w.__origSet;
    if (w.__origGet) proto.getItem = w.__origGet;
  });
}

test.describe("dailyDraftStorage — silent fallback on localStorage failure", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test("setItem throws (quota exceeded): writeDrafts returns false, no exception", async ({
    page,
  }) => {
    await breakLocalStorage(page, "throw-set");
    const result = await page.evaluate(async (mod) => {
      const m = await import(mod);
      // Should NOT throw
      const ok = m.writeDrafts({ AAPL: "hello" });
      // writePendingUndo returns void but must also not throw
      let undoThrew = false;
      try {
        m.writePendingUndo({
          ticker: "AAPL",
          text: "x",
          submittedAt: Date.now(),
          origin: "t",
        });
      } catch {
        undoThrew = true;
      }
      return { ok, undoThrew };
    }, STORAGE_MODULE);
    expect(result.ok).toBe(false);
    expect(result.undoThrew).toBe(false);
    await restoreLocalStorage(page);
  });

  test("getItem throws (private mode): readDrafts → {}, readPendingUndo → null", async ({
    page,
  }) => {
    await breakLocalStorage(page, "throw-all");
    const result = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return { drafts: m.readDrafts(), undo: m.readPendingUndo() };
    }, STORAGE_MODULE);
    expect(result.drafts).toEqual({});
    expect(result.undo).toBeNull();
    await restoreLocalStorage(page);
  });

  test("parse* raw helpers also fall back silently on malformed input", async ({ page }) => {
    // parse helpers don't touch localStorage, but must never throw on garbage input
    const result = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return {
        drafts: m.parseDraftsRaw("not-json{{"),
        undo: m.parsePendingUndoRaw("also-not-json"),
        nullDrafts: m.parseDraftsRaw(null),
        nullUndo: m.parsePendingUndoRaw(null),
      };
    }, STORAGE_MODULE);
    expect(result.drafts).toEqual({});
    expect(result.undo).toBeNull();
    expect(result.nullDrafts).toEqual({});
    expect(result.nullUndo).toBeNull();
  });

  test("recovers after localStorage becomes writable again", async ({ page }) => {
    await breakLocalStorage(page, "throw-set");
    // Attempt write while broken — silently fails
    await page.evaluate(async (mod) => {
      const m = await import(mod);
      m.writeDrafts({ AAPL: "lost" });
    }, STORAGE_MODULE);

    // Restore and try again
    await restoreLocalStorage(page);
    const ok = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.writeDrafts({ AAPL: "saved" });
    }, STORAGE_MODULE);
    expect(ok).toBe(true);

    const drafts = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return m.readDrafts();
    }, STORAGE_MODULE);
    expect(drafts).toEqual({ AAPL: "saved" });
  });

  test("read after failed write returns empty (no partial/stale data leaked)", async ({
    page,
  }) => {
    await breakLocalStorage(page, "throw-set");
    await page.evaluate(async (mod) => {
      const m = await import(mod);
      m.writeDrafts({ AAPL: "never-persisted" });
      m.writePendingUndo({
        ticker: "AAPL",
        text: "never",
        submittedAt: Date.now(),
        origin: "t",
      });
    }, STORAGE_MODULE);
    await restoreLocalStorage(page);

    const result = await page.evaluate(async (mod) => {
      const m = await import(mod);
      return { drafts: m.readDrafts(), undo: m.readPendingUndo() };
    }, STORAGE_MODULE);
    expect(result.drafts).toEqual({});
    expect(result.undo).toBeNull();
  });
});
