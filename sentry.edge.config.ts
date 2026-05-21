/**
 * Stage 14 — Sentry edge runtime init (middleware, edge route handlers).
 *
 * DSN env 미설정 시 noop.
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
