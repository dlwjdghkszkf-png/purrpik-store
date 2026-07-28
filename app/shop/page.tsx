import type { Metadata } from "next";
import Link from "next/link";
import type { PetType } from "@/lib/supabase/types";
import { getMasterProducts } from "@/lib/products/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "전체 상품",
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
 * P1-1: 캐시된 cookie-less 로더 사용. 조회 실패는 throw되어 error.tsx가 처리하고,
 *       "등록된 상품 없음"으로 위장되지 않는다. pet_type 필터는 메모리에서 적용.
 */
async function fetchMasterProducts(filters: ShopSearchParams) {
  const all = await getMasterProducts();
  const pt = filters.pet_type;
  if (pt === "cat") return all.filter((p) => p.pet_type === "cat" || p.pet_type === "both");
  if (pt === "dog") return all.filter((p) => p.pet_type === "dog" || p.pet_type === "both");
  if (pt === "both") return all.filter((p) => p.pet_type === "both");
  return all;
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
  const pageTitle =
    pet_type === "cat"
      ? "고양이 상품"
      : pet_type === "dog"
        ? "강아지 상품"
        : pet_type === "both"
          ? "강아지·고양이 공용 상품"
          : "전체 상품";

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>{pageTitle}</span>
        </nav>
        <h1 className="mt-3">{pageTitle}</h1>
        <p className="mt-3 text-mute-1">
          길고양이 셸터부터 쿨매트까지 — 클릭 후 옵션을 선택하세요
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
