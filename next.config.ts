import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Stage 14 — Sentry build-time wrapper.
 *
 * SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN env 없이도 build는 통과 (sourcemap 업로드만 skip).
 * silent=true: env 없을 때 build 로그 깨끗.
 * widenClientFileUpload=true: 모든 client chunk symbolicate.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // sourcemap 업로드는 auth token 있을 때만.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
