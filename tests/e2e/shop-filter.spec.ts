/**
 * Stage 15 — E2E #2: /shop 카탈로그 필터 동작.
 *
 * Supabase 없이도 page render + FilterBar UI는 존재해야 한다.
 * 필터 클릭 시 URL searchParams 갱신을 검증.
 */

import { test, expect } from "@playwright/test";

test("/shop 렌더 + 필터 UI 존재 + 클릭 시 URL 갱신", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveTitle(/전체 상품/);

  // FilterBar의 ALL-IN-ONE 버튼 존재 검증.
  const allInOneBtn = page.getByRole("button", { name: /ALL-IN-ONE/i });
  await expect(allInOneBtn).toBeVisible();

  // 클릭 → URL에 edition=ALL_IN_ONE 반영.
  await allInOneBtn.click();
  await expect(page).toHaveURL(/edition=ALL_IN_ONE/);

  // 사이즈 M 필터.
  const sizeM = page.getByRole("button", { name: /^M$/ });
  if (await sizeM.count()) {
    await sizeM.first().click();
    await expect(page).toHaveURL(/size=M/);
  }
});
