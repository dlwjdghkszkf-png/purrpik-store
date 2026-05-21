/**
 * Stage 14 — robots.txt (Stage 16에서 sitemap과 함께 마무리 예정).
 *
 * - 결제 결과 / API / dev 페이지는 disallow
 * - sitemap은 prod 도메인 절대 경로
 */

import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dev/",
          "/api/",
          "/order/success",
          "/order/fail",
          "/orders/lookup",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
