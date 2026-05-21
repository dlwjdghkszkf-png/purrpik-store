/**
 * Stage 14 — Next.js client-side instrumentation entry.
 *
 * Sentry browser init은 consent='accepted' 시에만 활성 (sentry.client.config.ts 내부 가드).
 * DSN env 미설정 시 noop.
 */

import "./sentry.client.config";

// Sentry router transition hook (Next 16 App Router 트레이싱).
export { captureRouterTransitionStart as onRouterTransitionStart } from "@sentry/nextjs";
