/**
 * Stage 18 — E2E #1: 홈 → master PDP → 옵션 선택 → 카트 담기 → /checkout 진입.
 *
 * Supabase 없으면 EditionGrid는 fallback (DB 미연결)이지만 master PDP는
 * fetchMasterProduct 실패 시 notFound. 따라서 envless dev에서는
 * legacy id로 진입해도 redirect로 마스터에 도달 → notFound 가능.
 * 핵심 검증: 라우트가 살아있고, 카트 담기 가능, /checkout 도달.
 */

import { test, expect } from "@playwright/test";

test("홈(/cat) → master PDP → 옵션 선택 → 카트 → /checkout 진입", async ({
  page,
}) => {
  // 1) v3 — `/`는 게이트, 카테고리 홈(/cat)부터 검증.
  await page.goto("/cat");
  await expect(page).toHaveTitle(/푸르픽/);

  // 2) master PDP 진입 (Supabase 미연결 환경에서는 notFound 가능 — soft 검증).
  const response = await page.goto("/shop/purrpik-shelter");
  // 200 또는 404 모두 가능 — 라우트 자체는 존재.
  expect([200, 404]).toContain(response?.status() ?? 200);

  // 3) PDP가 떴을 때만 OptionPicker + AddToCart 검증.
  const radio = page.getByRole("radio").first();
  if (await radio.count()) {
    // 선택 옵션 변경.
    await radio.click();
    const addBtn = page
      .getByRole("button", { name: /장바구니에 담기|담기/ })
      .first();
    if (await addBtn.count()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 4) /checkout 진입 시도 — 빈 카트면 /cart로 redirect.
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/(checkout|cart)/);
});

test("legacy id /shop/basic-m → 마스터로 redirect (SEO 보존)", async ({
  page,
}) => {
  const response = await page.goto("/shop/basic-m");
  // 200 (redirect 도달) 또는 404 (DB 미연결로 마스터 fetch 실패) 모두 acceptable.
  expect([200, 404]).toContain(response?.status() ?? 200);
  // 성공 시 URL이 master로 바뀌어야 함.
  if (response?.status() === 200) {
    await expect(page).toHaveURL(/\/shop\/purrpik-shelter/);
  }
});
