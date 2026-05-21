import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export const metadata: Metadata = {
  title: "리뷰 — 푸르픽",
  description:
    "푸르픽 길고양이 셸터 실사용자 리뷰. 사진 후기·별점·사용 환경별 코멘트.",
};

// 리뷰는 일 단위 변경 가정 — ISR 24h.
export const revalidate = 86400;

type FilterMode = "all" | "photo" | "five";

interface SearchParams {
  product?: string;
  filter?: FilterMode;
}

async function fetchReviews(
  productId?: string,
): Promise<ReviewRow[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("reviews")
      .select("*")
      .order("display_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (productId) {
      q = q.eq("product_id", productId);
    }
    const { data, error } = await q;
    if (error) {
      console.warn("[/reviews] reviews fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[/reviews] supabase unavailable:", (e as Error).message);
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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

function FilterTabs({
  product,
  current,
}: {
  product?: string;
  current: FilterMode;
}) {
  const tabs: { key: FilterMode; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "photo", label: "사진만" },
    { key: "five", label: "별점 5점만" },
  ];
  return (
    <div className="flex gap-2 border-b border-line">
      {tabs.map((t) => {
        const params = new URLSearchParams();
        if (product) params.set("product", product);
        if (t.key !== "all") params.set("filter", t.key);
        const href = `/reviews${params.toString() ? `?${params.toString()}` : ""}`;
        const active = current === t.key;
        return (
          <Link
            key={t.key}
            href={href}
            className={
              "px-4 py-3 text-small font-medium transition " +
              (active
                ? "border-b-2 border-brand-mustard text-ink"
                : "text-mute-2 hover:text-ink")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const productId = params.product;
  const filter: FilterMode =
    params.filter === "photo" || params.filter === "five" ? params.filter : "all";

  const all = await fetchReviews(productId);
  const filtered = all.filter((r) => {
    if (filter === "photo") return firstPhoto(r.photos) !== null;
    if (filter === "five") return r.rating >= 5;
    return true;
  });

  const avg =
    all.length === 0
      ? 0
      : Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) /
        10;

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>전체 리뷰</span>
        </nav>
        <h1 className="mt-3">전체 리뷰</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-mute-1">
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(avg)} />
            <span className="font-semibold text-ink">{avg.toFixed(1)}</span>
            <span>/ 5</span>
          </div>
          <span>총 {all.length}개 리뷰</span>
          {productId && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[12px]">
              필터: {productId}
            </span>
          )}
        </div>
      </header>

      <div className="container-page">
        <FilterTabs product={productId} current={filter} />
      </div>

      <section className="container-page py-8 pb-20">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white py-20 text-center">
            <p className="text-mute-1">조건에 맞는 리뷰가 없습니다.</p>
            <Link
              href="/reviews"
              className="text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
            >
              필터 초기화
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const photo = firstPhoto(r.photos);
              return (
                <article
                  key={r.id}
                  className="flex flex-col rounded-lg border border-line bg-white overflow-hidden"
                >
                  {photo && (
                    <div className="relative aspect-video w-full bg-zinc-100">
                      <Image
                        src={photo}
                        alt={r.title ?? "리뷰 사진"}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <Stars rating={r.rating} />
                    {r.title && (
                      <h3 className="mt-3 text-base font-semibold leading-snug">
                        {r.title}
                      </h3>
                    )}
                    <p className="mt-2 flex-1 text-small text-mute-1 leading-relaxed whitespace-pre-line">
                      {r.body}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-small text-mute-2">
                          {r.reviewer_name ?? "익명"}
                        </span>
                        {r.reviewer_pet_type && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-mute-1">
                            {r.reviewer_pet_type}
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-mute-2">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
