import { Check } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { editionLabel, formatPrice } from "@/lib/products/format";

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
 * 에디션 라벨(머스타드) · 제품명 · 가격 · 설명 · 메리트 리스트.
 * description_html은 자체 마이그레이션 데이터(신뢰 가능)라 dangerouslySetInnerHTML 사용.
 */
export function ProductSummary({ product }: { product: ProductRow }) {
  return (
    <div>
      <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
        {editionLabel(product.edition)}
      </p>
      <h1 className="mt-3">{product.name}</h1>
      <p className="mt-4 text-h2 font-semibold tabular-nums text-ink">
        {formatPrice(product.price)}
      </p>

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
