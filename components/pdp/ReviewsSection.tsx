import Link from "next/link";
import { Star } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * ReviewsSection — PDP 리뷰 그리드 (RSC).
 *
 * props로 받은 reviews(최대 6)를 카드 그리드로 표시.
 * 평균 별점은 받은 reviews 기준 계산 — 정확한 전체 평균은 Stage 11 /reviews 에서.
 */
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
}: {
  productId: string;
  reviews: ReviewRow[];
}) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
      : 0;

  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            REVIEWS
          </p>
          <h2 className="mt-3">리뷰 ({reviews.length}건)</h2>
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
        <p className="text-small text-mute-1">
          아직 등록된 리뷰가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-lg border border-line bg-white p-5"
            >
              <Stars rating={r.rating} />
              {r.title && (
                <h3 className="mt-3 text-base font-semibold text-ink">
                  {r.title}
                </h3>
              )}
              <p className="mt-2 text-small text-mute-1 leading-relaxed">
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
