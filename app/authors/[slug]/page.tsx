import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ARTICLE_CATEGORIES,
  buildAuthorJsonLd,
  getAllArticles,
  getAllAuthors,
  getAuthorBySlug,
} from "@/lib/articles";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

type Params = { slug: string };

export async function generateStaticParams() {
  return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: `${author.name} — ${author.role} | 푸르픽`,
    description: author.bio,
    alternates: { canonical: author.url },
    openGraph: {
      title: author.name,
      description: author.bio,
      type: "profile",
      url: author.url,
      images: author.avatar ? [{ url: author.avatar }] : undefined,
    },
  };
}

export const revalidate = 3600;

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return notFound();

  const articles = getAllArticles().filter((a) => a.author === slug);
  const jsonLd = buildAuthorJsonLd(author);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="container-page max-w-3xl pt-12 pb-20">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">홈</Link>
          <span className="mx-2">›</span>
          <span>저자</span>
        </nav>

        <header className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-center">
          {author.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatar}
              alt={author.name}
              className="h-24 w-24 rounded-full bg-bg-2 object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{author.name}</h1>
            <p className="mt-1 text-mute-1">{author.role}</p>
            {author.credentials && author.credentials.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {author.credentials.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-bg-2 px-3 py-1 text-xs text-mute-1"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        <section className="mt-10 prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {author.content}
          </ReactMarkdown>
        </section>

        {author.social && Object.values(author.social).some(Boolean) && (
          <section className="mt-8 flex gap-4 text-small">
            {author.social.instagram && (
              <a
                href={author.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mute-1 hover:text-ink"
              >
                Instagram
              </a>
            )}
            {author.social.twitter && (
              <a
                href={author.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mute-1 hover:text-ink"
              >
                Twitter
              </a>
            )}
            {author.social.website && (
              <a
                href={author.social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mute-1 hover:text-ink"
              >
                Website
              </a>
            )}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="text-mute-1 hover:text-ink"
              >
                Email
              </a>
            )}
          </section>
        )}

        {articles.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-bold">
              {author.name}의 글 ({articles.length})
            </h2>
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {articles.map((a) => (
                <li
                  key={`${a.category_slug}/${a.slug}`}
                  className="rounded-2xl border border-line bg-white p-5 transition hover:shadow-sm"
                >
                  <Link
                    href={`/articles/${a.category_slug}/${a.slug}`}
                    className="block"
                  >
                    <span className="text-xs text-mute-2">
                      {ARTICLE_CATEGORIES[a.category_slug].label}
                    </span>
                    <h3 className="mt-1 font-semibold leading-snug line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-small text-mute-1 line-clamp-2">
                      {a.excerpt}
                    </p>
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
