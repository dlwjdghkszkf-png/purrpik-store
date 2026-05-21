import { defineConfig, devices } from "@playwright/test";

/**
 * Stage 15 — Playwright E2E + 시각 회귀 설정.
 *
 * webServer로 `bun run dev`를 자동 시작 (이미 실행 중이면 재사용).
 * baseURL은 env 우선, 미설정시 localhost:3000.
 * 시각 회귀 baseline은 `tests/e2e/visual.spec.ts-snapshots/` 에 자동 생성.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : "html",
  timeout: 30_000,
  expect: {
    // 시각 회귀 — 폰트 로딩/anti-alias 차이 허용.
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.05,
    },
  },
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "ko-KR",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
