# E2E tests (Playwright)

End-to-end tests that exercise the onboarding beacon / lifecycle event delivery
in a real Chromium browser. Unit tests still run under Vitest (`bun test`);
these tests are isolated under `e2e/` and excluded from the Vitest run.

## Setup (one-time)

```bash
bunx playwright install chromium
```

## Run

```bash
# headless against the running Vite dev server (auto-started if not up)
bunx playwright test

# interactive UI mode
bunx playwright test --ui

# single file
bunx playwright test e2e/onboarding-beacon.spec.ts
```

## What is covered

`onboarding-beacon.spec.ts` verifies the three browser lifecycle paths that
the onboarding abandonment tracking depends on, without requiring a logged-in
Supabase session:

1. **`visibilitychange` → hidden** while a beacon is enqueued — the queued
   event must remain in `localStorage` (proves no data loss on tab switch /
   mobile background).
2. **`pagehide`** dispatched on the page — the queued event must remain in
   `localStorage` so the next session can flush it.
3. **`beforeunload` (full navigation away)** — after reloading, the queued
   event must survive in `localStorage`.
4. **`flushQueue()` drains** queued items once the page is back (mocked
   network response).

The tests stub `fetch` so they never hit the real backend, and they seed
`localStorage` directly to simulate an authenticated session's queue.
