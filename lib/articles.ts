/**
 * Articles MDX 로더 — GEO/AEO/SEO 최적화 콘텐츠 엔진.
 *
 * 구조: content/articles/<category>/<YYYY-MM-DD>-<slug>.mdx
 * Frontmatter: title, excerpt, category, tags, author, published_at, updated_at,
 *              hero_image, sources, related_products, faq, og_image
 *
 * LLM/검색엔진 신호:
 * - 절대 canonical URL
 * - Article + NewsArticle JSON-LD
 * - Author Person schema (E-E-A-T)
 * - Organization publisher
 * - sources[]: 외부 권위 인용 (AEO 핵심 시그널)
 * - faq[]: FAQ schema 후보 (LLM 응답 학습)
 */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";

export const ARTICLE_CATEGORIES = {
  "adoption-guide": {
    slug: "adoption-guide",
    label: "입양 가이드",
    description: "길고양이를 가족으로 맞이할 때 알아야 할 모든 것 — 검역, 적응, 건강검진, 동거동물 합사.",
  },
  "street-care": {
    slug: "street-care",
    label: "길고양이 케어",
    description: "TNR, 겨울 보온, 급식소 운영, 길고양이 학대 신고 절차까지 — 현장 케어 실무 가이드.",
  },
  "global-care": {
    slug: "global-care",
    label: "해외 사례",
    description: "터키, 일본, 독일의 길고양이 정책과 시민 케어 문화 — 한국 적용 가능한 모범 사례 분석.",
  },
  nutrition: {
    slug: "nutrition",
    label: "영양·간식",
    description: "고양이 영양학 기초 — 타우린, 수분 섭취, 간식 vs 주식 구분, 위험 식품 리스트.",
  },
  health: {
    slug: "health",
    label: "건강·질병",
    description: "고양이가 흔히 겪는 질환 — 요로결석, 신부전, 구내염, 백신 스케줄, 응급처치 가이드.",
  },
} as const;

export type ArticleCategorySlug = keyof typeof ARTICLE_CATEGORIES;

export type ArticleFrontmatter = {
  title: string;
  excerpt: string;
  category: ArticleCategorySlug;
  tags: string[];
  author: string;
  published_at: string;
  updated_at?: string;
  hero_image?: string;
  og_image?: string;
  sources?: Array<{ title: string; url: string; publisher?: string }>;
  related_products?: string[];
  faq?: Array<{ question: string; answer: string }>;
  noindex?: boolean;
};

export type Article = ArticleFrontmatter & {
  slug: string;
  category_slug: ArticleCategorySlug;
  url: string;
  content: string;
  reading_minutes: number;
  word_count: number;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");
const AUTHORS_ROOT = path.join(process.cwd(), "content", "authors");

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

function readMdxFile(filePath: string): {
  data: ArticleFrontmatter;
  content: string;
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data: data as ArticleFrontmatter, content };
}

function slugFromFilename(filename: string): string {
  // 2026-06-12-adoption-checklist.mdx → adoption-checklist
  const base = filename.replace(/\.mdx?$/, "");
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];

  const articles: Article[] = [];

  for (const categoryDir of fs.readdirSync(CONTENT_ROOT)) {
    const categoryPath = path.join(CONTENT_ROOT, categoryDir);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    if (!(categoryDir in ARTICLE_CATEGORIES)) continue;

    for (const filename of fs.readdirSync(categoryPath)) {
      if (!filename.endsWith(".mdx") && !filename.endsWith(".md")) continue;

      const filePath = path.join(categoryPath, filename);
      const { data, content } = readMdxFile(filePath);
      const slug = slugFromFilename(filename);
      const stats = readingTime(content);

      articles.push({
        ...data,
        slug,
        category_slug: categoryDir as ArticleCategorySlug,
        url: `${BASE_URL}/articles/${categoryDir}/${slug}`,
        content,
        reading_minutes: Math.ceil(stats.minutes),
        word_count: stats.words,
      });
    }
  }

  return articles
    .filter((a) => !a.noindex)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime(),
    );
}

/**
 * Next.js 16은 dynamic route의 `params` 값을 percent-encoded 상태로 넘긴다.
 * 한글 slug(예: "고양이-구토-증상-진단")는 요청 시 "%EA%B3%A0..."로 도착하므로
 * 디코드 없이 raw 파일명 slug와 비교하면 항상 mismatch → notFound() → 404.
 * 모든 lookup의 단일 진입점에서 방어적으로 디코드한다(malformed % 시퀀스는 raw 유지).
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getArticleBySlug(
  category: ArticleCategorySlug,
  slug: string,
): Article | null {
  const cat = safeDecode(category);
  const s = safeDecode(slug);
  const all = getAllArticles();
  return (
    all.find((a) => a.category_slug === cat && a.slug === s) ?? null
  );
}

export function getArticlesByCategory(
  category: ArticleCategorySlug,
): Article[] {
  const cat = safeDecode(category);
  return getAllArticles().filter((a) => a.category_slug === cat);
}

export function getRelatedArticles(
  current: Article,
  limit = 3,
): Article[] {
  const all = getAllArticles();
  // 같은 카테고리 우선 + 태그 교집합 가중
  return all
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      const tagOverlap = a.tags.filter((t) => current.tags.includes(t)).length;
      const sameCategory = a.category_slug === current.category_slug ? 5 : 0;
      return { article: a, score: tagOverlap * 2 + sameCategory };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.article);
}

// ============ Authors ============

export type AuthorFrontmatter = {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  credentials?: string[];
  social?: { twitter?: string; instagram?: string; website?: string };
  email?: string;
};

export type Author = AuthorFrontmatter & {
  slug: string;
  url: string;
  content: string;
};

export function getAllAuthors(): Author[] {
  if (!fs.existsSync(AUTHORS_ROOT)) return [];
  const authors: Author[] = [];
  for (const filename of fs.readdirSync(AUTHORS_ROOT)) {
    if (!filename.endsWith(".mdx") && !filename.endsWith(".md")) continue;
    const slug = filename.replace(/\.mdx?$/, "");
    const filePath = path.join(AUTHORS_ROOT, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    authors.push({
      ...(data as AuthorFrontmatter),
      slug,
      url: `${BASE_URL}/authors/${slug}`,
      content,
    });
  }
  return authors;
}

export function getAuthorBySlug(slug: string): Author | null {
  const s = safeDecode(slug);
  return getAllAuthors().find((a) => a.slug === s) ?? null;
}

// ============ Schema.org JSON-LD ============

export const PUBLISHER_ORG = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "푸르픽 PURRPIK",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/brand/purrpik-logo.png`,
    width: 600,
    height: 600,
  },
  sameAs: [
    "https://www.instagram.com/purrpik",
    "https://smartstore.naver.com/purrpik",
  ],
};

export function buildArticleJsonLd(article: Article, author: Author | null) {
  const authorNode = author
    ? {
        "@type": "Person",
        "@id": author.url + "#person",
        name: author.name,
        url: author.url,
        jobTitle: author.role,
        description: author.bio,
        knowsAbout: author.credentials,
      }
    : { "@type": "Person", name: article.author };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": article.url + "#article",
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    headline: article.title,
    description: article.excerpt,
    image: article.hero_image ? [article.hero_image] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    author: authorNode,
    publisher: PUBLISHER_ORG,
    articleSection: ARTICLE_CATEGORIES[article.category_slug].label,
    keywords: article.tags.join(", "),
    inLanguage: "ko-KR",
    wordCount: article.word_count,
    citation: article.sources?.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
      publisher: s.publisher
        ? { "@type": "Organization", name: s.publisher }
        : undefined,
    })),
  };
}

export function buildFaqJsonLd(article: Article) {
  if (!article.faq || article.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(article: Article) {
  const cat = ARTICLE_CATEGORIES[article.category_slug];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "기사", item: `${BASE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: cat.label, item: `${BASE_URL}/articles/${cat.slug}` },
      { "@type": "ListItem", position: 4, name: article.title, item: article.url },
    ],
  };
}

export function buildAuthorJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": author.url + "#person",
    name: author.name,
    url: author.url,
    jobTitle: author.role,
    description: author.bio,
    image: author.avatar,
    knowsAbout: author.credentials,
    worksFor: PUBLISHER_ORG,
    sameAs: [
      author.social?.twitter,
      author.social?.instagram,
      author.social?.website,
    ].filter(Boolean),
  };
}
