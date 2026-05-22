"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import type { Database, ProductVariants } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { editionLabel, formatPrice } from "@/lib/products/format";
import { useCartStore } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Sku = ProductVariants["skus"][number];

/**
 * AddToCartButton — Stage 18 리팩.
 *
 * variant SKU 정보를 cart store에 함께 저장. 카트/체크아웃에서 SKU 단위 식별.
 * selectedSku null이면 비활성화.
 */
export function AddToCartButton({
  product,
  selectedSku,
  quantity,
  className,
}: {
  product: ProductRow;
  selectedSku: Sku | null;
  quantity: number;
  className?: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setOpen = useCartStore((s) => s.setOpen);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const unitPrice = selectedSku?.price ?? product.price;
  const total = unitPrice * quantity;
  const disabled = !selectedSku || pending;

  const variantLabel = selectedSku
    ? `${editionLabel(selectedSku.edition)} ${selectedSku.size}`
    : "";
  const itemName = selectedSku
    ? `${product.name} · ${variantLabel}`
    : product.name;

  const buildItem = () => ({
    productId: product.id,
    variantId: selectedSku?.id,
    name: itemName,
    price: unitPrice,
    quantity,
    hero_image: product.hero_image ?? "",
  });

  const fireAddToCart = () => {
    trackAddToCart({
      item_id: selectedSku?.id ?? product.id,
      item_name: itemName,
      price: unitPrice,
      quantity,
    });
  };

  const handleAdd = () => {
    if (!selectedSku) return;
    addItem(buildItem());
    fireAddToCart();
    setOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!selectedSku) return;
    addItem(buildItem());
    fireAddToCart();
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
        disabled={disabled}
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
        disabled={disabled}
        className="mt-2 h-12 w-full text-base"
      >
        {pending ? "이동 중…" : "바로 결제"}
      </Button>
    </div>
  );
}
