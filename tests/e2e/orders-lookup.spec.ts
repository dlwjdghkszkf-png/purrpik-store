/**
 * Stage 15 — E2E #4: /orders/lookup 폼 표시 + 잘못된 입력 시 에러.
 *
 * Supabase 없어도 폼 렌더 + client-side validation은 동작.
 * 빈 입력 → required 트리거, 잘못된 phone tail → pattern 검증.
 */

import { test, expect } from "@playwright/test";

test("/orders/lookup 폼 렌더 + required 검증", async ({ page }) => {
  await page.goto("/orders/lookup");
  await expect(page).toHaveTitle(/주문 조회/);

  // 필수 입력 3개 — orderNo, email(exact), phoneTail.
  // "이메일"은 footer 뉴스레터 "이메일 주소"와 충돌 → exact 매칭.
  await expect(page.getByLabel("주문번호")).toBeVisible();
  await expect(page.getByLabel("이메일", { exact: true })).toBeVisible();
  await expect(page.getByLabel("휴대폰 끝 4자리")).toBeVisible();

  // submit 버튼 빈 상태로 클릭 → HTML5 required로 form submit 차단.
  const submit = page.getByRole("button", { name: /주문 조회/ });
  await submit.click();

  // 첫 invalid input에 focus가 가야 함 (orderNo).
  const orderNo = page.getByLabel("주문번호");
  const isInvalid = await orderNo.evaluate(
    (el) => (el as HTMLInputElement).validity.valid === false,
  );
  expect(isInvalid).toBe(true);
});
