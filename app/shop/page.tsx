import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterBar } from "@/components/shop/FilterBar";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type SizeFilter = "M" | "L";
type EditionFilter = "BASIC" | "ALL_IN_ONE";

export const metadata: Metadata = {
  title: "전체 상품 — 푸르픽",
  description:
    "푸르픽 길고양이집 4종 — BASIC M/L · ALL-IN-ONE M/L. 사이즈와 구성으로 선택하세요.",
};

// 24h ISR — 카탈로그는 일 단위로만 변경.
export const revalidate = 86400;

interface ShopSearchParams {
  size?: SizeFilter;
  edition?: EditionFilter;
}

async function fetchProducts(
  filters: ShopSearchParams
): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (filters.size === "M" || filters.size === "L") {
      query = query.eq("size_class", filters.size);
    }
    if (filters.edition === "BASIC" || filters.edition === "ALL_IN_ONE") {
      query = query.eq("edition", filters.edition);
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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const size = params.size === "M" || params.size === "L" ? params.size : undefined;
  const edition =
    params.edition === "BASIC" || params.edition === "ALL_IN_ONE"
      ? params.edition
      : undefined;

  const products = await fetchProducts({ size, edition });
  const hasFilter = Boolean(size || edition);

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
          4중 구조 길고양이 야외 보호 셸터 — 사이즈와 구성으로 선택
        </p>
      </header>

      <div className="container-page">
        <FilterBar />
        <p className="mt-5 text-small text-mute-1">
          총 {products.length}개 상품
        </p>
      </div>

      <section className="container-page py-6 pb-20">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white py-20 text-center">
            <p className="text-mute-1">
              {hasFilter
                ? "조건에 맞는 상품이 없습니다."
                : "등록된 상품이 없습니다."}
            </p>
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
