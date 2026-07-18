/**
 * sitemap.xml — 정적 라우트 + 마스터 PDP + Articles + Authors 동적 통합.
 *
 * /order/* /orders/lookup /api/* /dev/* 는 robots.ts disallow.
 */

import type { MetadataRoute } from "next";

import {
  ARTICLE_CATEGORIES,
  getAllArticles,
  getAllAuthors,
} from "@/lib/articles";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.purrpik.co.kr";

const MASTER_ID = "purrpik-shelter";

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
    { url: `${BASE_URL}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  const masterRoute: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/shop/${MASTER_ID}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
  // ?sku= 쿼리 변형은 canonical(/shop/MASTER_ID)과 충돌하는 중복 URL이라 사이트맵에서 제외.

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(
    ARTICLE_CATEGORIES,
  ).map((slug) => ({
    url: `${BASE_URL}/articles/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: a.url,
    lastModified: new Date(a.updated_at ?? a.published_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = getAllAuthors().map((a) => ({
    url: a.url,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...masterRoute,
    ...categoryRoutes,
    ...articleRoutes,
    ...authorRoutes,
  ];
}
