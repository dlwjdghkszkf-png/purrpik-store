/**
 * Stage 14 — Sentry browser init.
 *
 * 브라우저 Sentry는 cookie consent='accepted'일 때만 활성화 (개인정보보호법 가이드).
 * DSN env 미설정 시 noop.
 *
 * 호출 진입점: instrumentation-client.ts
 */

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

function consentAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("cookie_consent") === "accepted";
  } catch {
    return false;
  }
}

if (DSN && consentAccepted()) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    // 개인정보 미수집 — IP/email/쿠키 raw 값 자동 마스킹.
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
