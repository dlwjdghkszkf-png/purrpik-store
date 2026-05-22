import Link from "next/link";
import { Star } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * ReviewsHero — Stage 19: PDP 상단 별점·리뷰수 헤더 (RSC).
 *
 * 한국 D2C 표준 패턴 (쿠팡·네이버스토어·29CM·무신사).
 * - 평균 별점 + 리뷰수 (mustard fill / grey)
 * - 포토 리뷰 가로 스크롤 미리보기 (최대 6장)
 * - "리뷰 전체 보기" 앵커
 *
 * reviews 0개: "첫 리뷰 작성" 안내만 표시.
 * 이모지 금지 (전역 룰).
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

function HeroStars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`평균 별점 ${rating.toFixed(1)} / 5`}
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

export function ReviewsHero({
  productId,
  reviews,
}: {
  productId: string;
  reviews: ReviewRow[];
}) {
  if (reviews.length === 0) {
    return (
      <section
        className="mt-4 rounded-md border border-dashed border-line bg-white px-4 py-3"
        aria-label="리뷰 요약"
      >
        <p className="text-small text-mute-1">
          첫 리뷰를 남겨주세요 — 작성 시 1,000P 적립.
        </p>
      </section>
    );
  }

  const avg = reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;

  const photoReviews = reviews
    .map((r) => ({ id: r.id, src: firstPhoto(r.photos) }))
    .filter((p): p is { id: string; src: string } => p.src !== null)
    .slice(0, 6);

  return (
    <section
      className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      aria-label="리뷰 요약"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2">
          <HeroStars rating={avg} />
          <span className="text-base font-semibold tabular-nums text-ink">
            {avg.toFixed(1)}
          </span>
        </div>
        <span className="text-small text-mute-1">
          리뷰 {reviews.length.toLocaleString("ko-KR")}건
        </span>

        {photoReviews.length > 0 && (
          <div
            className="hidden md:flex items-center gap-1.5 overflow-x-auto"
            aria-label="포토 리뷰 미리보기"
          >
            {photoReviews.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.src}
                alt="리뷰 사진"
                loading="lazy"
                className="size-10 shrink-0 rounded-sm border border-line object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/reviews?product=${productId}`}
        className="text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep shrink-0"
      >
        리뷰 전체 보기 →
      </Link>
    </section>
  );
}
