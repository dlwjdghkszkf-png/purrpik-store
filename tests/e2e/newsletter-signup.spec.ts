/**
 * Stage 15 — E2E #5: 뉴스레터 가입 폼 동작.
 *
 * Footer의 뉴스레터 form — 이메일 입력 + 동의 체크 후 가입 버튼 활성화 검증.
 * 실제 POST는 Supabase env 없으면 db_error로 fail할 수 있으나, UI 동작만 검증.
 */

import { test, expect } from "@playwright/test";

test("푸터 뉴스레터 — 이메일 + 동의 후 가입 버튼 활성화", async ({ page }) => {
  await page.goto("/");

  // Footer까지 스크롤 (lazy hydration 보장).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // 이메일 입력 필드 + 동의 체크박스 + 가입 버튼.
  // shadcn Checkbox는 native input이 아니라 button[role=checkbox] → role 매칭 사용.
  const emailInput = page.getByLabel("이메일 주소").first();
  const agreeCheckbox = page.getByRole("checkbox", {
    name: /마케팅 수신 동의/,
  });
  const submitBtn = page.getByRole("button", { name: /^가입/ });

  await expect(emailInput).toBeVisible();
  await expect(submitBtn).toBeVisible();

  // 초기 상태 — disabled (email 없고 동의 안 됨).
  await expect(submitBtn).toBeDisabled();

  // 이메일만 입력 → 여전히 disabled (동의 안 됨).
  await emailInput.fill("test@example.com");
  await expect(submitBtn).toBeDisabled();

  // 동의 체크 → 활성화. Radix Checkbox는 click으로 토글.
  await agreeCheckbox.click();
  await expect(submitBtn).toBeEnabled();
});
