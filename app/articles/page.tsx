import type { Metadata } from "next";
import Link from "next/link";

import {
  ARTICLE_CATEGORIES,
  getAllArticles,
  PUBLISHER_ORG,
} from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

export const metadata: Metadata = {
  title: "길고양이 매거진 — 푸르픽",
  description:
    "수의사 자문 검증을 거친 길고양이 입양·케어·해외 사례·영양·건강 가이드. 매일 1편씩 발행합니다.",
  alternates: {
    canonical: `${BASE_URL}/articles`,
    types: { "application/rss+xml": `${BASE_URL}/rss.xml` },
  },
  openGraph: {
    title: "길고양이 매거진 — 푸르픽",
    description:
      "수의사 자문 검증을 거친 길고양이 케어 가이드. 매일 1편 발행.",
    type: "website",
    url: `${BASE_URL}/articles`,
    siteName: "푸르픽 PURRPIK",
  },
};

export const revalidate = 3600;

type SearchParams = Promise<{ tag?: string }>;

export default async function ArticlesIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { tag } = await searchParams;
  const all = getAllArticles();
  const articles = tag
    ? all.filter((a) => a.tags.includes(tag))
    : all;
  const categories = Object.values(ARTICLE_CATEGORIES);

  // 태그 빈도 카운트 (상위 20개).
  const tagFreq = new Map<string, number>();
  for (const a of all) {
    for (const t of a.tags) tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
  }
  const topTags = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/articles`,
    name: "길고양이 매거진",
    description:
      "수의사 자문 검증을 거친 길고양이 케어 콘텐츠 모음",
    url: `${BASE_URL}/articles`,
    isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}/#website` },
    publisher: PUBLISHER_ORG,
    inLanguage: "ko-KR",
    hasPart: articles.slice(0, 20).map((a) => ({
      "@type": "Article",
      "@id": a.url + "#article",
      headline: a.title,
      url: a.url,
      datePublished: a.published_at,
      author: { "@type": "Person", name: a.author },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <header className="container-page pt-12 pb-8">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">홈</Link>
          <span className="mx-2">›</span>
          <span>매거진</span>
        </nav>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          길고양이 매거진
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-mute-1">
          수의사 자문 검증을 거친 길고양이 입양·케어·해외 사례·영양·건강 가이드.
          모든 의학·법률 주장은 출처를 명시합니다.
        </p>
      </header>

      <section className="container-page pb-8">
        <h2 className="sr-only">카테고리</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/articles/${cat.slug}`}
                className="block rounded-2xl border border-line bg-white px-4 py-5 text-center text-small font-medium transition hover:border-ink"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {topTags.length > 0 && (
        <section className="container-page pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-small text-mute-2">태그</span>
            {tag && (
              <Link
                href="/articles"
                className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white"
              >
                # {tag} ✕
              </Link>
            )}
            {topTags.map(([t, count]) => (
              <Link
                key={t}
                href={`/articles?tag=${encodeURIComponent(t)}`}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  t === tag
                    ? "bg-ink text-white"
                    : "bg-bg-2 text-mute-1 hover:bg-line"
                }`}
              >
                #{t}
                <span className="ml-1 text-mute-2">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <h2 className="mb-6 text-2xl font-bold">
          {tag ? `# ${tag} (${articles.length}편)` : "최근 발행"}
        </h2>
        {articles.length === 0 ? (
          <p className="text-mute-1">
            {tag
              ? "해당 태그의 글이 없습니다."
              : "아직 발행된 글이 없습니다."}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const cat = ARTICLE_CATEGORIES[a.category_slug];
              return (
                <li
                  key={`${a.category_slug}/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md"
                >
                  <Link
                    href={`/articles/${a.category_slug}/${a.slug}`}
                    className="flex flex-1 flex-col"
                  >
                    {a.hero_image ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-bg-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.hero_image}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-bg-2" />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-xs font-medium uppercase tracking-wide text-mute-2">
                        {cat.label} · {a.reading_minutes}분 읽기
                      </span>
                      <h3 className="mt-2 text-lg font-bold leading-snug line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-2 flex-1 text-small text-mute-1 line-clamp-3">
                        {a.excerpt}
                      </p>
                      <time
                        dateTime={a.published_at}
                        className="mt-4 text-xs text-mute-2"
                      >
                        {new Date(a.published_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
