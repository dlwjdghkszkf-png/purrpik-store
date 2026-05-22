/**
 * Stage 18 — E2E #2: /shop 카탈로그 마스터 1개 카드 + 펫타입 필터.
 *
 * Stage 18 리팩: 4 카드 → 1 마스터 카드. 사이즈/에디션 필터 제거,
 * pet_type 필터만 유지 (링크 기반).
 * Supabase 없이도 page render + 헤더 + 필터 링크는 존재해야 한다.
 */

import { test, expect } from "@playwright/test";

test("/shop 렌더 + 펫타입 필터 링크 존재", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveTitle(/전체 상품/);

  // 펫타입 필터 — "고양이" 링크 존재.
  const catLink = page.getByRole("link", { name: "고양이" }).first();
  await expect(catLink).toBeVisible();

  // 클릭 → URL에 pet_type=cat 반영.
  await catLink.click();
  await expect(page).toHaveURL(/pet_type=cat/);
});
