import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
  getArticlesByCategory,
  PUBLISHER_ORG,
} from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

type Params = { category: string };

export async function generateStaticParams() {
  return Object.keys(ARTICLE_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!(category in ARTICLE_CATEGORIES)) return {};
  const cat = ARTICLE_CATEGORIES[category as ArticleCategorySlug];
  return {
    title: `${cat.label} — 길고양이 매거진 | 푸르픽`,
    description: cat.description,
    alternates: { canonical: `${BASE_URL}/articles/${cat.slug}` },
    openGraph: {
      title: `${cat.label} — 길고양이 매거진`,
      description: cat.description,
      type: "website",
      url: `${BASE_URL}/articles/${cat.slug}`,
    },
  };
}

export const revalidate = 3600;

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  if (!(category in ARTICLE_CATEGORIES)) return notFound();
  const cat = ARTICLE_CATEGORIES[category as ArticleCategorySlug];
  const articles = getArticlesByCategory(category as ArticleCategorySlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/articles/${cat.slug}`,
    name: cat.label,
    description: cat.description,
    url: `${BASE_URL}/articles/${cat.slug}`,
    publisher: PUBLISHER_ORG,
    inLanguage: "ko-KR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="container-page pt-12 pb-8">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">홈</Link>
          <span className="mx-2">›</span>
          <Link href="/articles" className="hover:text-ink">매거진</Link>
          <span className="mx-2">›</span>
          <span>{cat.label}</span>
        </nav>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">{cat.label}</h1>
        <p className="mt-4 max-w-2xl text-lg text-mute-1">{cat.description}</p>
      </header>

      <section className="container-page pb-20">
        {articles.length === 0 ? (
          <p className="text-mute-1">곧 첫 글이 발행됩니다.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li
                key={a.slug}
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
                      {a.reading_minutes}분 읽기
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
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
