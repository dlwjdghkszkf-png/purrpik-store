import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ProductCard } from "@/components/shop/ProductCard";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * Stage 17 v3 — /both 카테고리 홈.
 *
 * pet_type='both' 제품 조회. 결과 0개면 "곧 출시" 안내 + /dog `/cat` 링크.
 * 향후 호환 부속(쿨매트, 팔렛트 깔판 단품 등)이 들어오면 자연스럽게 그리드 표시.
 */

export const metadata: Metadata = {
  title: "강아지·고양이 — 푸르픽",
  description:
    "강아지·고양이 모두를 위한 호환 제품. 두 반려동물 한 집에 사는 가정을 위한 푸르픽 큐레이션.",
};

export const revalidate = 86400;

// Stage 18 — 마스터만. 'both' pet_type 마스터가 추가되면 표시.
async function fetchBothProducts(): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("is_master", true)
      .eq("pet_type", "both")
      .order("display_order", { ascending: true });
    if (error) {
      console.warn("[/both] products fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[/both] supabase unavailable:", (e as Error).message);
    return [];
  }
}

export default async function BothHome() {
  const products = await fetchBothProducts();

  return (
    <>
      {/* Hero */}
      <section className="container-page py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-secondary items-center justify-center mb-8"
            aria-hidden="true"
          >
            <PawPrint
              className="w-14 h-14 md:w-16 md:h-16 text-brand-mustard"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            강아지·고양이 모두 위한
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-mute-1 leading-relaxed">
            두 반려동물이 한 집에 산다면, 두 마리 모두 쓸 수 있는 호환 제품을
            소개합니다.
          </p>
        </div>
      </section>

      {/* 제품 또는 placeholder */}
      <section className="container-page pb-20">
        {products.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-line bg-white p-8 md:p-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-ink">
              곧 출시
            </h2>
            <p className="mt-3 text-sm md:text-base text-mute-1 leading-relaxed">
              호환 부속품 라인업을 준비 중입니다.
              <br className="hidden md:block" />
              출시 시 가장 먼저 알려드릴게요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cat"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-brand-mustard text-white font-semibold hover:bg-brand-mustard-deep transition-colors"
              >
                고양이 제품 보기
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dog"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-line bg-white text-sm font-medium text-ink hover:border-ink transition-colors"
              >
                강아지 알림 받기
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-small text-mute-1 mb-5">
              총 {products.length}개 상품
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
