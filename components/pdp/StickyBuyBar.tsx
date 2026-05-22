"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Database, ProductVariants } from "@/lib/supabase/types";
import {
  formatPrice,
  formatPriceRange,
  parseVariants,
} from "@/lib/products/format";
import { MobileOptionSheet } from "./MobileOptionSheet";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * StickyBuyBar — Stage 19: 모바일 전용 하단 고정 바 (Client).
 *
 * "옵션 선택" 클릭 → MobileOptionSheet open.
 * 시트에서 옵션·수량 선택 후 "장바구니 담기" → cart 추가 + 시트 닫음 + MiniCartDrawer open.
 * 데스크탑은 일반 OptionPicker 사용 (StickyBuyBar 자체가 lg:hidden).
 *
 * 단일 product(variants 없음)는 PDP 옵션 picker로 스크롤 (현재 마스터만 노출).
 */
interface Props {
  product: ProductRow;
  initialSku?: string;
}

export function StickyBuyBar({ product, initialSku }: Props) {
  const variants = useMemo<ProductVariants | null>(
    () => parseVariants(product.variants),
    [product.variants],
  );
  const isMaster = product.is_master && variants !== null;
  const skuCount = variants?.skus.length ?? 0;

  const [sheetOpen, setSheetOpen] = useState(false);

  const priceDisplay = isMaster
    ? formatPriceRange(
        product.price_min ?? product.price,
        product.price_max ?? product.price,
      )
    : formatPrice(product.price);

  const handleOpen = () => {
    if (isMaster) {
      setSheetOpen(true);
      return;
    }
    if (typeof window !== "undefined") {
      const target = document.querySelector('[role="radiogroup"]');
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur px-4 py-3 lg:hidden"
        role="region"
        aria-label="구매 바"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-brand-mustard line-clamp-1">
              {isMaster ? `${skuCount}가지 옵션` : product.name}
            </p>
            <p className="text-base font-semibold tabular-nums text-ink">
              {priceDisplay}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-mustard px-5 text-sm font-medium text-white transition hover:bg-brand-mustard-deep active:translate-y-px"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {isMaster ? "옵션 선택" : "장바구니"}
          </button>
        </div>
      </div>

      {isMaster && variants && (
        <MobileOptionSheet
          product={product}
          variants={variants}
          initialSku={initialSku}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </>
  );
}
