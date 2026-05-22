import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  editionLabel,
  formatPrice,
  formatPriceRange,
  parseVariants,
} from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * EditionGrid — Stage 18 리팩.
 *
 * 기존: 4 별도 product 카드 그리드.
 * 신규: 1 마스터 카드 + 4 SKU 미니카드 (변형 직관 노출 + PDP 사전 선택).
 *
 * 데이터: products WHERE is_master AND active=true LIMIT 1 + variants(JSONB).
 */
async function fetchMasterProduct(): Promise<ProductRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("is_master", true)
      .order("display_order", { ascending: true })
      .limit(1);
    if (error) {
      console.warn("[EditionGrid] master fetch error:", error.message);
      return null;
    }
    return data?.[0] ?? null;
  } catch (e) {
    console.warn("[EditionGrid] supabase unavailable:", (e as Error).message);
    return null;
  }
}

export async function EditionGrid() {
  const master = await fetchMasterProduct();
  const variants = master ? parseVariants(master.variants) : null;

  // DB 미연결/마이그 미적용 환경 fallback.
  if (!master || !variants) {
    return (
      <section className="container-page py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <h2>에디션과 사이즈를 골라주세요</h2>
          <p className="mt-3 text-mute-1">
            BASIC은 본체 + 담요, ALL-IN-ONE은 쿨매트·깔판·밥그릇까지 한 번에.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-line bg-zinc-50 p-12 text-center">
          <p className="text-mute-1">데이터 연결 대기 중</p>
        </div>
      </section>
    );
  }

  const priceRange = formatPriceRange(
    master.price_min ?? master.price,
    master.price_max ?? master.price,
  );

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2>에디션과 사이즈를 골라주세요</h2>
          <p className="mt-3 text-mute-1">
            BASIC은 본체 + 담요, ALL-IN-ONE은 쿨매트·깔판·밥그릇까지 한 번에.
          </p>
        </div>
        <span className="inline-flex items-center self-start rounded-full bg-brand-mustard/10 px-3 py-1 text-small font-medium text-brand-mustard">
          ALL-IN-ONE L · 실구매자 다수 선택
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* 대표 카드 (master) */}
        <Link
          href={`/shop/${master.id}`}
          className="group block overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
            {master.hero_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={master.hero_image}
                alt={master.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                <span className="text-mute-2 text-small">{master.name}</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="text-small font-medium uppercase tracking-wider text-brand-mustard">
              SHELTER · 4 옵션
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <h3 className="text-h3 font-semibold">{master.name}</h3>
              <span className="text-h3 font-semibold tabular-nums">
                {priceRange}
              </span>
            </div>
            <p className="mt-3 text-small text-mute-1">
              에디션(BASIC / ALL-IN-ONE) × 사이즈(M / L) — PDP에서 선택
            </p>
          </div>
        </Link>

        {/* 4 SKU 미니카드 — 클릭 시 PDP `?sku=` 사전 선택 */}
        <div>
          <p className="mb-4 text-small font-medium text-mute-1">
            바로 옵션 선택
          </p>
          <div className="grid grid-cols-2 gap-3">
            {variants.skus.map((sku) => (
              <Link
                key={sku.id}
                href={`/shop/${master.id}?sku=${sku.id}`}
                className="group rounded-lg border border-line bg-white p-4 transition-colors hover:border-ink"
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-mustard">
                  {editionLabel(sku.edition)}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-base font-semibold">{sku.size}</span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatPrice(sku.price)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-mute-2">
                  외부 {sku.size_outer}
                </p>
                <p className="mt-3 text-[11px] font-medium text-mute-1 group-hover:text-ink">
                  선택 →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
