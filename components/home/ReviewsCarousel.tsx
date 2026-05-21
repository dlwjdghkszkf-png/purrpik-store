import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

async function fetchReviews(): Promise<ReviewRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("display_order", { ascending: false })
      .limit(8);
    if (error) {
      console.warn("[ReviewsCarousel] reviews fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[ReviewsCarousel] supabase unavailable:", (e as Error).message);
    return [];
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`별점 ${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-4 fill-brand-mustard text-brand-mustard"
              : "size-4 text-zinc-300"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export async function ReviewsCarousel() {
  const reviews = await fetchReviews();

  return (
    <section className="py-16 md:py-24">
      <div className="container-page mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            REVIEWS
          </p>
          <h2 className="mt-3">실사용자 후기</h2>
          <p className="mt-3 text-small text-mute-1">
            @purrpik 사용자분들이 직접 남겨주신 후기
          </p>
        </div>
        <Link
          href="/reviews"
          className="self-start text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
        >
          전체 리뷰 보기 →
        </Link>
      </div>

      {/* 가로 스크롤 + scroll-snap (모바일 스와이프 / 데스크탑 드래그·스크롤) */}
      <div className="container-page">
        <div
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]"
          role="region"
          aria-label="실사용자 후기 캐러셀"
        >
          {reviews.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <article
                  key={`ph-${i}`}
                  className="min-w-[280px] max-w-[320px] snap-start rounded-lg border border-line bg-white p-5"
                >
                  <div className="aspect-video w-full rounded-md bg-zinc-100" />
                  <p className="mt-4 text-small text-mute-2">데이터 연결 대기 중</p>
                </article>
              ))
            : reviews.map((r) => (
                <article
                  key={r.id}
                  className="flex min-w-[280px] max-w-[320px] flex-col snap-start rounded-lg border border-line bg-white p-5"
                >
                  <Stars rating={r.rating} />
                  {r.title && (
                    <h3 className="mt-3 text-base font-semibold leading-snug">
                      {r.title}
                    </h3>
                  )}
                  <p className="mt-2 line-clamp-3 flex-1 text-small text-mute-1 leading-relaxed">
                    {r.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-small text-mute-2">
                      {r.reviewer_name ?? "익명"}
                    </span>
                    {r.reviewer_pet_type && (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-mute-1">
                        {r.reviewer_pet_type}
                      </span>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
