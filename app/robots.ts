/**
 * robots.txt — Stage 14 베이스 + LLM 크롤러 명시 허용 (Stage 20 articles).
 *
 * - GPTBot / ClaudeBot / Claude-Web / PerplexityBot / Google-Extended / CCBot 명시 Allow
 * - 결제 결과 / API / dev 페이지 disallow
 * - sitemap.xml + RSS 노출
 */

import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

const PRIVATE_PATHS = [
  "/dev/",
  "/api/",
  "/order/success",
  "/order/fail",
  "/orders/lookup",
];

const LLM_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot-News",
  "CCBot",
  "Bytespider",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Yeti",
  "Daumoa",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...LLM_BOTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
