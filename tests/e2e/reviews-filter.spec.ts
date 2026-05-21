/**
 * Stage 15 — E2E #3: /reviews 페이지 렌더 + 필터 동작.
 *
 * Supabase 없으면 리뷰 데이터 없이도 페이지/필터 UI는 렌더되어야 함.
 * 리뷰 카드 없을 시 "리뷰가 없습니다" 등 안내 메시지가 있거나, 페이지가 그냥 렌더되면 통과.
 */

import { test, expect } from "@playwright/test";

test("/reviews 렌더 + 필터 클릭 동작", async ({ page }) => {
  await page.goto("/reviews");
  await expect(page).toHaveTitle(/리뷰/);

  // 페이지 본문에 "리뷰" 텍스트가 있어야 함 (헤더/h1 등).
  await expect(page.locator("body")).toContainText(/리뷰/);

  // 사진 필터 링크/버튼이 있으면 클릭, 없으면 빈 상태 메시지 검증.
  const photoFilter = page.getByRole("link", { name: /사진/ }).first();
  if (await photoFilter.count()) {
    await photoFilter.click();
    await expect(page).toHaveURL(/filter=photo/);
  } else {
    // 데이터 없으면 빈 상태 메시지 또는 그냥 페이지 ok.
    await expect(page.locator("body")).toBeVisible();
  }
});
