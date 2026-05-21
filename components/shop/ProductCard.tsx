import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import {
  editionLabel,
  formatPrice,
  summarizeIncludes,
} from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * ProductCard — 카탈로그·홈 공용 상품 카드 (RSC).
 *
 * 카피 톤: 스펙 용어 유지 (₩, 본체/담요/쿨매트/깔판/밥그릇).
 * 시각: 이미지 placeholder → 에디션(머스타드) → 사이즈/가격 → 구성품 요약.
 * Stage 14에서 <Image> 전환 예정.
 */
export function ProductCard({ product }: { product: ProductRow }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {/* TODO: <Image> 전환 (Stage 14 이미지 파이프라인) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
          <span className="text-mute-2 text-small">
            {editionLabel(product.edition)} {product.size_class}
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-small font-medium uppercase tracking-wider text-brand-mustard">
          {editionLabel(product.edition)}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <h3 className="text-h3 font-semibold">{product.size_class}</h3>
          <span className="text-h3 font-semibold tabular-nums">
            {formatPrice(product.price)}
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
      </div>
    </Link>
  );
}
