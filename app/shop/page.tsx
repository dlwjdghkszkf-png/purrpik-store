import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database, PetType } from "@/lib/supabase/types";
import { ProductCard } from "@/components/shop/ProductCard";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export const metadata: Metadata = {
  title: "전체 상품 — 푸르픽",
  description:
    "푸르픽 4중 구조 셸터 — 고양이·강아지·둘 다. 반려동물·사이즈·구성으로 선택하세요.",
};

// 24h ISR — 카탈로그는 일 단위로만 변경.
export const revalidate = 86400;

interface ShopSearchParams {
  pet_type?: PetType;
}

/**
 * Stage 18 — 카탈로그는 마스터 product만 표시.
 * 4 SKU 옵션 선택은 PDP `/shop/purrpik-shelter`의 OptionPicker에서.
 * 카테고리(pet_type) 필터만 유지. size/edition 필터는 마스터 1개 화면이라 의미 없어 제거.
 */
async function fetchMasterProducts(
  filters: ShopSearchParams,
): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("is_master", true)
      .order("display_order", { ascending: true });

    if (
      filters.pet_type === "cat" ||
      filters.pet_type === "dog" ||
      filters.pet_type === "both"
    ) {
      query = query.eq("pet_type", filters.pet_type);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[/shop] products fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[/shop] supabase unavailable:", (e as Error).message);
    return [];
  }
}

function emptyMessage(petType: PetType | undefined): string {
  if (petType === "dog") {
    return "강아지 신상품이 곧 출시됩니다.";
  }
  if (petType === "both") {
    return "강아지·고양이 호환 제품이 곧 출시됩니다.";
  }
  return "등록된 상품이 없습니다.";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const pet_type =
    params.pet_type === "cat" ||
    params.pet_type === "dog" ||
    params.pet_type === "both"
      ? params.pet_type
      : undefined;

  const products = await fetchMasterProducts({ pet_type });
  const hasFilter = Boolean(pet_type);

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>전체 상품</span>
        </nav>
        <h1 className="mt-3">전체 상품</h1>
        <p className="mt-3 text-mute-1">
          4중 구조 야외 보호 셸터 — 클릭 후 에디션·사이즈를 선택하세요
        </p>
      </header>

      <div className="container-page">
        <div className="flex flex-wrap items-center gap-2 border-y border-line py-5 text-small">
          <span className="font-medium text-mute-1">반려동물</span>
          {[
            { value: undefined, label: "전체" },
            { value: "cat" as const, label: "고양이" },
            { value: "dog" as const, label: "강아지" },
            { value: "both" as const, label: "둘 다" },
          ].map((opt) => {
            const active = pet_type === opt.value;
            const href = opt.value ? `/shop?pet_type=${opt.value}` : "/shop";
            return (
              <Link
                key={opt.label}
                href={href}
                aria-pressed={active}
                className={`rounded-md border px-3 py-1.5 transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line text-mute-1 hover:border-ink hover:text-ink"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
        <p className="mt-5 text-small text-mute-1">
          총 {products.length}개 상품
        </p>
      </div>

      <section className="container-page py-6 pb-20">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white py-20 text-center">
            <p className="text-mute-1">{emptyMessage(pet_type)}</p>
            {hasFilter && (
              <Link
                href="/shop"
                className="text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
              >
                필터 초기화
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
