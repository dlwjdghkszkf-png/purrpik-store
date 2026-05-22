/**
 * Stage 17 v3 — Multi-pet 게이트 E2E.
 *
 * 검증 시나리오:
 *   1) `/?gate=1` → 게이트 3 카드(cat/dog/both) 노출
 *   2) 고양이 카드 클릭 → `/cat` 이동 + 헤더 배지 "고양이 보는 중" 표시
 *   3) `/` 재진입(쿼리 없이) → 자동 `/cat` redirect
 *   4) 헤더 배지 X 클릭 → clear + `/?gate=1` 재진입 + 다시 3 카드 표시
 */

import { test, expect } from "@playwright/test";

test.describe("Multi-pet 게이트", () => {
  test.beforeEach(async ({ context }) => {
    // 매 테스트마다 깨끗한 storage.
    await context.clearCookies();
  });

  test("게이트 카드 선택 → /cat 이동 → 자동 redirect → 배지 reset 전체 흐름", async ({
    page,
  }) => {
    // 1) `/?gate=1` 진입 → 게이트 3 카드 노출.
    await page.goto("/?gate=1");
    await expect(
      page.getByRole("heading", { name: "당신의 반려동물은?" })
    ).toBeVisible();

    const catCard = page.locator('[data-pet-type="cat"]').first();
    const dogCard = page.locator('[data-pet-type="dog"]').first();
    const bothCard = page.locator('[data-pet-type="both"]').first();
    await expect(catCard).toBeVisible();
    await expect(dogCard).toBeVisible();
    await expect(bothCard).toBeVisible();

    // 2) 고양이 카드 클릭 → /cat 이동.
    await catCard.click();
    await expect(page).toHaveURL(/\/cat$/);

    // 3) 헤더 배지 표시 검증.
    const badge = page.getByTestId("pet-type-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText("고양이");

    // 4) `/` 재진입 시 (gate query 없이) → 자동 /cat redirect.
    await page.goto("/");
    await expect(page).toHaveURL(/\/cat$/);

    // 5) 헤더 배지 X 클릭 → /?gate=1 + 게이트 재표시.
    await badge.getByRole("button", { name: "반려동물 다시 선택" }).click();
    await expect(page).toHaveURL(/\?gate=1$/);
    await expect(
      page.getByRole("heading", { name: "당신의 반려동물은?" })
    ).toBeVisible();

    // 6) clear 이후엔 배지 사라짐.
    await expect(page.getByTestId("pet-type-badge")).toHaveCount(0);
  });

  test("강아지 카드 → /dog placeholder hero 노출", async ({ page }) => {
    await page.goto("/?gate=1");
    await page.locator('[data-pet-type="dog"]').first().click();
    await expect(page).toHaveURL(/\/dog$/);
    await expect(
      page.getByRole("heading", { name: "강아지 신상품 준비 중" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "출시 알림 받기" })
    ).toBeVisible();
  });

  test("둘 다 카드 → /both 진입", async ({ page }) => {
    await page.goto("/?gate=1");
    await page.locator('[data-pet-type="both"]').first().click();
    await expect(page).toHaveURL(/\/both$/);
    await expect(
      page.getByRole("heading", { name: "강아지·고양이 모두 위한" })
    ).toBeVisible();
  });

  test("/shop?pet_type=cat → URL 쿼리 유지", async ({ page }) => {
    await page.goto("/shop?pet_type=cat");
    await expect(page).toHaveURL(/pet_type=cat/);
    // Stage 18 — 펫타입 필터는 링크 기반. 활성 링크 aria-pressed=true.
    const catFilter = page.getByRole("link", {
      name: "고양이",
      exact: true,
    });
    await expect(catFilter.first()).toHaveAttribute("aria-pressed", "true");
  });
});
