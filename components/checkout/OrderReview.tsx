"use client";

import Link from "next/link";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart/store";
import { formatPrice } from "@/lib/products/format";

export function OrderReview() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const total = subtotal; // 무료배송 — 가격 1회만 강조 (다크패턴 회피)

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">주문 상품</h2>
        <Link
          href="/cart"
          className="text-xs text-mute-1 underline underline-offset-2 hover:text-ink"
        >
          주문 변경
        </Link>
      </div>

      <ul className="mt-5 space-y-3 divide-y divide-line">
        {items.map((it) => (
          <li
            key={it.productId}
            className="flex gap-3 pt-3 first:pt-0 text-sm"
          >
            <div className="w-12 h-12 shrink-0 bg-secondary rounded overflow-hidden flex items-center justify-center text-[10px] text-mute-2">
              {it.hero_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.hero_image}
                  alt={it.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "IMG"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-ink line-clamp-2">{it.name}</div>
              <div className="text-xs text-mute-1 mt-0.5">
                수량 {it.quantity}
              </div>
            </div>
            <div className="text-right tabular-nums text-ink">
              {formatPrice(it.price * it.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-5 border-t border-line">
        <div className="flex items-center justify-between text-sm text-mute-1">
          <span>배송비</span>
          <span>무료</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-mute-1">총 결제 금액</span>
          <span className="text-2xl font-bold text-ink tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </section>
  );
}
