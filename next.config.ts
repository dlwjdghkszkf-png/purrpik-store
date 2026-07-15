import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Stage 16 — 보안 헤더 + CSP.
 *
 * CSP는 토스 / Supabase / GA / Pixel / 솔라피 / jsdelivr(Pretendard) / 다음 우편번호 / 네이버페이 허용.
 * 네이버페이 주문형 SDK: sandbox=test-pay.naver.com, prod=npay-order.pstatic.net → *.naver.com + *.pstatic.net.
 * 'unsafe-inline' 'unsafe-eval'은 Next.js + shadcn + GA 호환성 위해 임시 허용 (P2 점검).
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.tosspayments.com https://www.googletagmanager.com https://connect.facebook.net https://t1.kakaocdn.net https://t1.daumcdn.net https://*.daum.net https://*.kakao.com https://*.naver.com https://*.pstatic.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://t1.daumcdn.net https://*.daumcdn.net https://*.pstatic.net",
  "font-src 'self' https://cdn.jsdelivr.net data:",
  "img-src 'self' data: blob: https: https://*.tosspayments.com https://www.google-analytics.com https://www.facebook.com https://*.daum.net https://*.kakaocdn.net https://*.daumcdn.net https://*.kakao.com",
  "connect-src 'self' https://*.supabase.co https://api.tosspayments.com https://www.google-analytics.com https://*.facebook.com https://*.sentry.io https://api.solapi.com https://*.daum.net https://*.kakao.com https://*.naver.com https://*.pstatic.net",
  "frame-src https://js.tosspayments.com https://*.tosspayments.com https://postcode.map.daum.net https://*.daumcdn.net https://*.daum.net https://*.kakao.com https://*.naver.com https://*.pstatic.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: cspDirectives },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
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
