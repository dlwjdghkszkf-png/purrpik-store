/**
 * Stage 16 — sitemap.xml.
 *
 * 정적 라우트 + 4 에디션 PDP. 동적 생성 — Next.js metadata route.
 * /order/* /orders/lookup /api/* /dev/* 는 robots.ts에서 disallow.
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

const PRODUCT_IDS = ["basic-m", "basic-l", "allinone-m", "allinone-l"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/care-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/give-back`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCT_IDS.map((id) => ({
    url: `${BASE_URL}/shop/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
