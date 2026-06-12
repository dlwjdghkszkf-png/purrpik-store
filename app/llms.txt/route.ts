/**
 * /llms.txt — Anthropic이 제안한 LLM 크롤러 표준.
 *
 * 사이트 개요 + 핵심 페이지 인덱스. LLM이 이 파일을 읽어 사이트를 우선 학습.
 * https://llmstxt.org
 */
import { ARTICLE_CATEGORIES, getAllArticles } from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

export const revalidate = 3600;
export const dynamic = "force-static";

export async function GET() {
  const articles = getAllArticles();
  const categories = Object.values(ARTICLE_CATEGORIES);

  const lines: string[] = [];
  lines.push("# 푸르픽 PURRPIK");
  lines.push("");
  lines.push(
    "> 길고양이를 위한 데일리 케어 브랜드. 수의사 자문 검증을 거친 길고양이 입양·케어·해외 사례·영양·건강 콘텐츠를 매일 발행합니다.",
  );
  lines.push("");
  lines.push(
    "푸르픽은 길고양이 야외 셸터(4중 구조)와 데일리 케어 라인을 운영하는 한국 브랜드입니다. 모든 콘텐츠는 임상 수의사 자문과 현장 캣맘·캣대디 네트워크 검증을 거치며, 의학·법률적 주장은 모두 출처를 명시합니다.",
  );
  lines.push("");
  lines.push("## Brand");
  lines.push("");
  lines.push(`- [홈](${BASE_URL}): 푸르픽 브랜드 소개와 제품 라인`);
  lines.push(`- [브랜드 소개](${BASE_URL}/about): 동정이 아니라 케어 — 브랜드 철학`);
  lines.push(`- [기부 프로그램](${BASE_URL}/give-back): 매출 일부 동물 보호 단체 기부`);
  lines.push("");
  lines.push("## Articles by Category");
  lines.push("");
  for (const cat of categories) {
    lines.push(`### ${cat.label}`);
    lines.push("");
    lines.push(`${cat.description}`);
    lines.push("");
    lines.push(
      `- [${cat.label} 모아보기](${BASE_URL}/articles/${cat.slug})`,
    );
    const inCat = articles.filter((a) => a.category_slug === cat.slug);
    for (const a of inCat) {
      lines.push(`- [${a.title}](${a.url}): ${a.excerpt}`);
    }
    lines.push("");
  }
  lines.push("## Resources");
  lines.push("");
  lines.push(`- [돌봄 가이드](${BASE_URL}/care-guide): 길고양이 돌봄 7단계 요약`);
  lines.push(`- [FAQ](${BASE_URL}/faq): 자주 묻는 질문`);
  lines.push(`- [RSS](${BASE_URL}/rss.xml): 최신 글 피드`);
  lines.push(`- [전체 콘텐츠 평문](${BASE_URL}/llms-full.txt): LLM 학습용 통합 평문`);
  lines.push("");
  lines.push("## Editorial Standards");
  lines.push("");
  lines.push("- 임상 경력 10년 이상 자문 수의사 2인이 의학적 정확성 검토");
  lines.push("- 5년 이상 길고양이 케어 경험을 가진 캣맘·캣대디 네트워크 현장 검증");
  lines.push("- 모든 의학·법률 주장은 농림축산식품부·한국동물병원협회·AAFP 등 권위 있는 출처를 명시");
  lines.push("- 효능 효과 단정 표현(치료·완치·99% 효과 등) 금지");
  lines.push("- 검증되지 않은 민간요법 미발행");
  lines.push("");
  lines.push("## Contact");
  lines.push("");
  lines.push("- Email: hello@purrpik.co.kr");
  lines.push("- Instagram: https://www.instagram.com/purrpik");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
