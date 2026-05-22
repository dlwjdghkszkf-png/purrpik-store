/**
 * Stage 15 — 시각 회귀 테스트.
 *
 * 5개 핵심 페이지 baseline 스크린샷 생성/비교.
 * 첫 실행 시 baseline 생성, 두 번째 실행부터 diff 검증.
 *
 * threshold=0.2, maxDiffPixelRatio=0.05 (playwright.config.ts global).
 * /checkout은 빈 카트면 /cart로 리다이렉트 → 대신 /faq 사용.
 */

import { test, expect } from "@playwright/test";

const PAGES = [
  // Stage 17 v3: `/`는 게이트, 기존 home 컨텐츠는 `/cat`으로 이전.
  { name: "gate", path: "/?gate=1" },
  { name: "cat", path: "/cat" },
  { name: "dog", path: "/dog" },
  { name: "both", path: "/both" },
  { name: "shop", path: "/shop" },
  { name: "pdp-basic-m", path: "/shop/basic-m" },
  { name: "cart-empty", path: "/cart" },
  { name: "faq", path: "/faq" },
];

// Desktop chromium만 시각 회귀 — 모바일 baseline은 따로 관리 부담.
test.describe.configure({ mode: "serial" });

for (const { name, path } of PAGES) {
  test(`visual: ${name}`, async ({ page, browserName }, testInfo) => {
    // 모바일 chrome 프로젝트는 skip — 시각 회귀는 desktop만.
    if (testInfo.project.name !== "chromium") {
      test.skip();
    }
    await page.goto(path);
    // networkidle 대신 domcontentloaded + 짧은 settle — Next dev는 networkidle이 안 닿을 수 있음.
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    // 애니메이션/transition disable.
    await page.addStyleTag({
      content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
    });
  });
}
