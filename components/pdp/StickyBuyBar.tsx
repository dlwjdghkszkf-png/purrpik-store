"use client";

import { ShoppingBag } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import {
  formatPrice,
  formatPriceRange,
  parseVariants,
} from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * StickyBuyBar — 모바일 전용 하단 고정 바 (Client).
 *
 * Stage 18 리팩: 마스터 product에서는 "옵션 선택" CTA로 동작.
 * (Add 직접 처리 시 variant 누락 위험 → PDP 상단 OptionPicker 스크롤이 안전).
 * 단일 product에서는 기존 quick-add 동작 유지 (현재는 마스터만 노출).
 */
export function StickyBuyBar({ product }: { product: ProductRow }) {
  const variants = parseVariants(product.variants);
  const isMaster = product.is_master && variants !== null;

  const priceDisplay = isMaster
    ? formatPriceRange(
        product.price_min ?? product.price,
        product.price_max ?? product.price,
      )
    : formatPrice(product.price);

  const handleScrollToOptions = () => {
    if (typeof window === "undefined") return;
    const target = document.querySelector('[role="radiogroup"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur px-4 py-3 lg:hidden"
      role="region"
      aria-label="구매 바"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-brand-mustard line-clamp-1">
            {product.name}
          </p>
          <p className="text-base font-semibold tabular-nums text-ink">
            {priceDisplay}
          </p>
        </div>
        <button
          type="button"
          onClick={handleScrollToOptions}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-mustard px-5 text-sm font-medium text-white transition hover:bg-brand-mustard-deep active:translate-y-px"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {isMaster ? "옵션 선택" : "장바구니"}
        </button>
      </div>
    </div>
  );
}
