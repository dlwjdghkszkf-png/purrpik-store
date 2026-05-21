"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products/format";

interface Props {
  item: CartItem;
}

export function CartLine({ item }: Props) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex gap-4 py-5">
      <div className="w-20 h-20 shrink-0 bg-secondary rounded-md overflow-hidden flex items-center justify-center text-[10px] text-mute-2">
        {item.hero_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.hero_image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          "IMG"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink line-clamp-2">
          {item.name}
        </div>
        <div className="text-xs text-mute-1 mt-1">
          단가 {formatPrice(item.price)}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div
            className="flex items-center border border-line rounded-md"
            role="group"
            aria-label="수량 조절"
          >
            <button
              type="button"
              aria-label="수량 감소"
              onClick={() => updateQty(item.productId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-secondary"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span
              className="w-10 text-center text-sm tabular-nums"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={() => updateQty(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-secondary"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            aria-label={`${item.name} 삭제`}
            onClick={() => removeItem(item.productId)}
            className="p-1.5 text-mute-1 hover:text-ink transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-base font-semibold text-ink tabular-nums">
          {formatPrice(lineTotal)}
        </div>
      </div>
    </li>
  );
}
