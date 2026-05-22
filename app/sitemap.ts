/**
 * Stage 16 → Stage 18 — sitemap.xml.
 *
 * 정적 라우트 + 마스터 PDP 1 + 4 SKU 사전선택 URL. 동적 생성 — Next.js metadata route.
 * /order/* /orders/lookup /api/* /dev/* 는 robots.ts에서 disallow.
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

const MASTER_ID = "purrpik-shelter";
const SKU_IDS = ["basic-m", "basic-l", "allinone-m", "allinone-l"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/cat`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/dog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/both`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/care-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/give-back`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 마스터 PDP 1개 (최우선) + 각 SKU 사전선택 URL 4개.
  const masterRoute: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/shop/${MASTER_ID}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
  const skuRoutes: MetadataRoute.Sitemap = SKU_IDS.map((sku) => ({
    url: `${BASE_URL}/shop/${MASTER_ID}?sku=${sku}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...masterRoute, ...skuRoutes];
}
