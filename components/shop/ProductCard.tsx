import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import {
  editionLabel,
  formatPrice,
  formatPriceRange,
  parseVariants,
  summarizeIncludes,
} from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * ProductCard — 카탈로그·홈 공용 상품 카드 (RSC).
 *
 * Stage 18: master product 우선 표시.
 *  - is_master + variants 있으면: name + 가격 range + 에디션·사이즈 요약.
 *  - 그 외 (legacy/단일 product): 기존 표기 유지.
 *
 * 카피 톤: 스펙 용어 유지.
 */
export function ProductCard({ product }: { product: ProductRow }) {
  const variants = parseVariants(product.variants);
  const isMaster = product.is_master && variants !== null;

  const priceDisplay = isMaster
    ? formatPriceRange(
        product.price_min ?? product.price,
        product.price_max ?? product.price,
      )
    : formatPrice(product.price);

  // 마스터: 에디션/사이즈 요약 (BASIC + ALL-IN-ONE · M / L)
  const masterSummary = isMaster
    ? buildMasterSummary(variants)
    : null;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {product.hero_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.hero_image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <span className="text-mute-2 text-small">
              {isMaster
                ? product.name
                : `${editionLabel(product.edition)} ${product.size_class}`}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        {isMaster ? (
          <>
            <p className="text-small font-medium uppercase tracking-wider text-brand-mustard">
              SHELTER · 4 옵션
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <h3 className="text-h3 font-semibold line-clamp-1">
                {product.name}
              </h3>
              <span className="text-h3 font-semibold tabular-nums">
                {priceDisplay}
              </span>
            </div>
            {masterSummary && (
              <p className="mt-2 line-clamp-1 text-small text-mute-1">
                {masterSummary}
              </p>
            )}
            <p className="mt-1 text-small text-mute-2">
              에디션·사이즈 선택 →
            </p>
          </>
        ) : (
          <>
            <p className="text-small font-medium uppercase tracking-wider text-brand-mustard">
              {editionLabel(product.edition)}
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <h3 className="text-h3 font-semibold">{product.size_class}</h3>
              <span className="text-h3 font-semibold tabular-nums">
                {priceDisplay}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-small text-mute-1">
              {summarizeIncludes(product.includes)}
            </p>
            {product.size_outer && (
              <p className="mt-1 text-small text-mute-2">
                외부 {product.size_outer}
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

function buildMasterSummary(
  variants: ReturnType<typeof parseVariants>,
): string | null {
  if (!variants) return null;
  return variants.axes
    .map((axis) => axis.options.map((o) => o.label).join(" / "))
    .join(" · ");
}
