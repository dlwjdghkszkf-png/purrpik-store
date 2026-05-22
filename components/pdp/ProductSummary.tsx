import { Check } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import {
  editionLabel,
  formatPrice,
  formatPriceRange,
  parseVariants,
} from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const MERITS = [
  "전국 무료배송",
  "30일 만족보증 환불",
  "60초 설치 — 도구·접착제 불필요",
  "4중 구조 · 자체 시험 검증",
];

/**
 * ProductSummary — PDP 우측 상단 핵심 정보 (RSC).
 *
 * Stage 18: 마스터는 가격 range 표시 + SHELTER 라벨.
 * 단일 product는 기존 표시 유지.
 */
export function ProductSummary({ product }: { product: ProductRow }) {
  const variants = parseVariants(product.variants);
  const isMaster = product.is_master && variants !== null;

  const topLabel = isMaster
    ? `SHELTER · ${variants?.skus.length ?? 0} 옵션`
    : editionLabel(product.edition);

  const priceDisplay = isMaster
    ? formatPriceRange(
        product.price_min ?? product.price,
        product.price_max ?? product.price,
      )
    : formatPrice(product.price);

  return (
    <div>
      <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
        {topLabel}
      </p>
      <h1 className="mt-3">{product.name}</h1>
      <p className="mt-4 text-h2 font-semibold tabular-nums text-ink">
        {priceDisplay}
      </p>
      {isMaster && (
        <p className="mt-1 text-small text-mute-2">
          아래에서 에디션·사이즈를 선택하면 가격이 확정됩니다.
        </p>
      )}

      {product.description_html && (
        <div
          className="mt-5 text-base text-mute-1 leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0"
          // description_html은 자체 마이그레이션 작성. 외부 입력 아님.
          dangerouslySetInnerHTML={{ __html: product.description_html }}
        />
      )}

      <ul className="mt-6 space-y-2">
        {MERITS.map((m) => (
          <li
            key={m}
            className="flex items-start gap-2 text-small text-ink"
          >
            <Check
              className="mt-0.5 size-4 shrink-0 text-brand-mustard"
              aria-hidden="true"
            />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
