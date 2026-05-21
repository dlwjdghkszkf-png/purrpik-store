"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products/format";
import { useCartStore } from "@/lib/cart/store";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * AddToCartButton — Zustand cart store에 추가 + MiniCart 드로어 열기 (Client).
 *
 * - "장바구니에 담기" 클릭 → addItem + setOpen(true)
 * - "바로 결제" 클릭 → addItem + /checkout 이동 (드로어 없이 직행)
 * - 추가 직후 1.5s 동안 success 피드백 표시.
 *
 * 머스타드는 메인 CTA에만. 보조 CTA는 ink outline.
 */
export function AddToCartButton({
  product,
  quantity,
  className,
}: {
  product: ProductRow;
  quantity: number;
  className?: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const total = product.price * quantity;

  const buildItem = () => ({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
    hero_image: product.hero_image ?? "",
  });

  const handleAdd = () => {
    addItem(buildItem());
    setOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(buildItem());
    startTransition(() => {
      router.push("/checkout");
    });
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="mustard"
        onClick={handleAdd}
        disabled={pending}
        className="h-14 w-full text-base"
        aria-live="polite"
      >
        {added ? (
          <>
            <Check className="mr-2 size-5" aria-hidden="true" />
            장바구니에 추가됨
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 size-5" aria-hidden="true" />
            장바구니에 담기 · {formatPrice(total)}
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleBuyNow}
        disabled={pending}
        className="mt-2 h-12 w-full text-base"
      >
        {pending ? "이동 중…" : "바로 결제"}
      </Button>
    </div>
  );
}
