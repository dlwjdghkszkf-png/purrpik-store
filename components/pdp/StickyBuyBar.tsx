"use client";

import { ShoppingBag } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/products/format";
import { useCartStore } from "@/lib/cart/store";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * StickyBuyBar — 모바일 전용 하단 고정 구매 바 (Client).
 *
 * 데스크톱(lg↑)에서는 hidden. PDP 우측 메인 CTA가 시야 밖일 때
 * 바로 장바구니 담기를 가능하게 함. quantity=1 고정 (간단성 우선).
 */
export function StickyBuyBar({ product }: { product: ProductRow }) {
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      hero_image: product.hero_image ?? "",
    });
    setOpen(true);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur px-4 py-3 lg:hidden"
      role="region"
      aria-label="구매 바"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-brand-mustard">
            {product.name}
          </p>
          <p className="text-base font-semibold tabular-nums text-ink">
            {formatPrice(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-mustard px-5 text-sm font-medium text-white transition hover:bg-brand-mustard-deep active:translate-y-px"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          장바구니
        </button>
      </div>
    </div>
  );
}
