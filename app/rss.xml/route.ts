/**
 * /rss.xml — Articles RSS 2.0 feed.
 *
 * 네이버 서치어드바이저 등록 가능. 구독 클라이언트(Feedly 등) 호환.
 */
import { ARTICLE_CATEGORIES, getAllArticles } from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

export const revalidate = 3600;
export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles().slice(0, 50);
  const buildDate = new Date().toUTCString();

  const items = articles
    .map((a) => {
      const cat = ARTICLE_CATEGORIES[a.category_slug];
      const pubDate = new Date(a.published_at).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${a.url}</link>
      <guid isPermaLink="true">${a.url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(cat.label)}</category>
      <author>hello@purrpik.co.kr (${escapeXml(a.author)})</author>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>푸르픽 매거진 — 길고양이 케어</title>
    <link>${BASE_URL}/articles</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>수의사 자문 검증을 거친 길고양이 입양·케어·해외 사례·영양·건강 가이드. 매일 발행.</description>
    <language>ko-KR</language>
    <copyright>© ${new Date().getFullYear()} 푸르픽 PURRPIK</copyright>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>Next.js</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
