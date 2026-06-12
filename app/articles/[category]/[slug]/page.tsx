import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  getAllArticles,
  getArticleBySlug,
  getAuthorBySlug,
  getRelatedArticles,
} from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

type Params = { category: string; slug: string };

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({
    category: a.category_slug,
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  if (!(category in ARTICLE_CATEGORIES)) return {};
  const article = getArticleBySlug(category as ArticleCategorySlug, slug);
  if (!article) return {};

  return {
    title: `${article.title} | 푸르픽 매거진`,
    description: article.excerpt,
    alternates: { canonical: article.url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: article.url,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at ?? article.published_at,
      authors: [article.author],
      tags: article.tags,
      images: article.og_image
        ? [{ url: article.og_image }]
        : article.hero_image
          ? [{ url: article.hero_image }]
          : undefined,
      siteName: "푸르픽 PURRPIK",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.og_image ?? article.hero_image,
    },
    other: {
      "article:author": article.author,
      "article:published_time": article.published_at,
      "article:section":
        ARTICLE_CATEGORIES[article.category_slug].label,
      "article:tag": article.tags.join(","),
    },
  };
}

export const revalidate = 3600;

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  if (!(category in ARTICLE_CATEGORIES)) return notFound();
  const article = getArticleBySlug(category as ArticleCategorySlug, slug);
  if (!article) return notFound();

  const author = getAuthorBySlug(article.author);
  const related = getRelatedArticles(article);
  const cat = ARTICLE_CATEGORIES[article.category_slug];

  const articleJsonLd = buildArticleJsonLd(article, author);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(article);
  const faqJsonLd = buildFaqJsonLd(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="container-page max-w-3xl pt-12 pb-20">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">홈</Link>
          <span className="mx-2">›</span>
          <Link href="/articles" className="hover:text-ink">매거진</Link>
          <span className="mx-2">›</span>
          <Link href={`/articles/${cat.slug}`} className="hover:text-ink">
            {cat.label}
          </Link>
        </nav>

        <header className="mt-4 mb-8">
          <span className="text-xs font-medium uppercase tracking-wide text-accent">
            {cat.label}
          </span>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-mute-1">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-small text-mute-2">
            {author && (
              <Link
                href={`/authors/${author.slug}`}
                className="flex items-center gap-2 hover:text-ink"
              >
                {author.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatar}
                    alt=""
                    className="h-7 w-7 rounded-full bg-bg-2 object-cover"
                  />
                )}
                <span className="font-medium">{author.name}</span>
              </Link>
            )}
            <span>·</span>
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{article.reading_minutes}분 읽기</span>
          </div>
        </header>

        {article.hero_image && (
          <figure className="mb-10 -mx-4 overflow-hidden rounded-2xl bg-bg-2 md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.hero_image}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>
        )}

        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {article.faq && article.faq.length > 0 && (
          <section className="mt-12 rounded-2xl bg-bg-2 p-6">
            <h2 className="text-xl font-bold">자주 묻는 질문</h2>
            <dl className="mt-4 space-y-5">
              {article.faq.map((q) => (
                <div key={q.question}>
                  <dt className="font-semibold">Q. {q.question}</dt>
                  <dd className="mt-2 text-mute-1">A. {q.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {article.sources && article.sources.length > 0 && (
          <section className="mt-10 border-t border-line pt-6">
            <h2 className="text-base font-semibold text-mute-1">참고 자료</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-small text-mute-2">
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink hover:underline"
                  >
                    {s.title}
                  </a>
                  {s.publisher && (
                    <span className="ml-1 text-mute-2">— {s.publisher}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {author && (
          <aside className="mt-10 rounded-2xl border border-line bg-bg-2 p-6">
            <div className="flex items-start gap-4">
              {author.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar}
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-full bg-white object-cover"
                />
              )}
              <div>
                <Link
                  href={`/authors/${author.slug}`}
                  className="font-bold hover:text-accent"
                >
                  {author.name}
                </Link>
                <p className="text-xs text-mute-2">{author.role}</p>
                <p className="mt-2 text-small text-mute-1 line-clamp-3">
                  {author.bio}
                </p>
              </div>
            </div>
          </aside>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-bold">함께 읽으면 좋은 글</h2>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {related.map((r) => (
                <li
                  key={`${r.category_slug}/${r.slug}`}
                  className="rounded-2xl border border-line bg-white p-4 transition hover:shadow-sm"
                >
                  <Link
                    href={`/articles/${r.category_slug}/${r.slug}`}
                    className="block"
                  >
                    <span className="text-xs text-mute-2">
                      {ARTICLE_CATEGORIES[r.category_slug].label}
                    </span>
                    <h3 className="mt-1 font-semibold leading-snug line-clamp-2">
                      {r.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
