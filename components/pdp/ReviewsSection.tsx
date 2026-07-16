import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * ReviewsSection — PDP 리뷰 섹션 (RSC).
 *
 * - 포토 리뷰 가로 스크롤 스트립 (사진 있는 리뷰 최대 10장)
 * - 리뷰 카드 그리드: 사진(있으면) + 짧은 USP 코멘트를 크게 강조
 * - USP가 돋보이도록 body(20자 이내)를 카드의 시각 주인공으로 배치
 */
function firstPhoto(photos: unknown): string | null {
  if (!Array.isArray(photos)) return null;
  const first = photos[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "url" in first) {
    const u = (first as { url?: unknown }).url;
    return typeof u === "string" ? u : null;
  }
  return null;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`별점 ${rating.toFixed(1)} / 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < full
              ? "size-4 fill-brand-mustard text-brand-mustard"
              : "size-4 text-zinc-300"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  productId,
  reviews,
  totalCount,
}: {
  productId: string;
  reviews: ReviewRow[];
  totalCount?: number;
}) {
  const count = totalCount ?? reviews.length;
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const photoReviews = reviews
    .map((r) => ({ id: r.id, src: firstPhoto(r.photos), body: r.body }))
    .filter(
      (p): p is { id: string; src: string; body: string } => p.src !== null,
    )
    .slice(0, 10);

  const gridReviews = reviews.slice(0, 6);

  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            REVIEWS
          </p>
          <h2 className="mt-3">리뷰 ({count.toLocaleString("ko-KR")}건)</h2>
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={avg} />
              <span className="text-small font-medium text-ink tabular-nums">
                {avg.toFixed(1)} / 5
              </span>
            </div>
          )}
        </div>
        <Link
          href={`/reviews?product=${productId}`}
          className="text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
        >
          이 상품 리뷰 전체 보기 →
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="text-small text-mute-1">아직 등록된 리뷰가 없습니다.</p>
      ) : (
        <>
          {/* 포토 리뷰 스트립 */}
          {photoReviews.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-small font-semibold text-ink">
                  포토 리뷰
                </span>
                <span className="text-small text-mute-2">
                  {photoReviews.length}
                </span>
              </div>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                {photoReviews.map((p) => (
                  <Link
                    key={p.id}
                    href={`/reviews?product=${productId}&filter=photo`}
                    className="group relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg border border-line sm:w-32"
                    aria-label={`포토 리뷰: ${p.body}`}
                  >
                    <Image
                      src={p.src}
                      alt="리뷰 사진"
                      fill
                      sizes="128px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* USP 코멘트 카드 그리드 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridReviews.map((r) => {
              const photo = firstPhoto(r.photos);
              return (
                <article
                  key={r.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-line bg-white"
                >
                  {photo && (
                    <div className="relative aspect-[4/3] w-full bg-zinc-100">
                      <Image
                        src={photo}
                        alt={r.title ?? "리뷰 사진"}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <Stars rating={r.rating} />
                    {/* USP 강조: 짧은 코멘트를 크게 */}
                    <p className="mt-3 text-lg font-semibold leading-snug text-ink">
                      {r.body}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-small text-mute-2">
                      {r.reviewer_name && <span>{r.reviewer_name}</span>}
                      {r.reviewer_pet_type && (
                        <span className="rounded-full border border-line px-2 py-0.5 text-[11px]">
                          {r.reviewer_pet_type}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
