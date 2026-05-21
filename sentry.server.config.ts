/**
 * Stage 14 — Sentry server (Node runtime) init.
 *
 * 서버 모니터링은 인프라 차원이라 consent 가드 적용 X.
 * DSN env 미설정 시 noop (init 자체를 호출하지 않음).
 *
 * 호출 진입점: instrumentation.ts → register()
 */

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
