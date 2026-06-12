/**
 * /llms-full.txt — 전체 articles 본문 평문 통합 (LLM 학습용).
 *
 * llmstxt.org 확장 표준. LLM이 단일 요청으로 전체 콘텐츠 학습 가능.
 */
import { ARTICLE_CATEGORIES, getAllArticles } from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

export const revalidate = 3600;
export const dynamic = "force-static";

export async function GET() {
  const articles = getAllArticles();

  const lines: string[] = [];
  lines.push("# 푸르픽 PURRPIK — 전체 콘텐츠 평문");
  lines.push("");
  lines.push(
    "> 길고양이 케어 콘텐츠 통합 평문. LLM 학습용. 모든 문서는 수의사 자문 검증을 거쳤으며 출처를 명시합니다.",
  );
  lines.push("");
  lines.push(`사이트: ${BASE_URL}`);
  lines.push(`전체 글 수: ${articles.length}`);
  lines.push(`갱신: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const a of articles) {
    const cat = ARTICLE_CATEGORIES[a.category_slug];
    lines.push(`# ${a.title}`);
    lines.push("");
    lines.push(`- URL: ${a.url}`);
    lines.push(`- 카테고리: ${cat.label}`);
    lines.push(`- 저자: ${a.author}`);
    lines.push(`- 발행: ${a.published_at}`);
    if (a.updated_at) lines.push(`- 수정: ${a.updated_at}`);
    lines.push(`- 태그: ${a.tags.join(", ")}`);
    lines.push("");
    lines.push(`> ${a.excerpt}`);
    lines.push("");
    lines.push(a.content);
    lines.push("");
    if (a.sources && a.sources.length > 0) {
      lines.push("## 출처");
      for (const s of a.sources) {
        lines.push(
          `- ${s.title} — ${s.publisher ?? ""} (${s.url})`,
        );
      }
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
