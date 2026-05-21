"use client";

/**
 * Stage 14 — /order/success의 클라이언트 사이드 작업:
 *   1. GA4 purchase + Meta Pixel Purchase 이벤트 발사 (clear 이전)
 *   2. 카트 clear (중복 발사 방지 위해 한 번만 fire되는 ref 가드 포함)
 *
 * Toss 멱등 결과(이미 처리된 결제)에서는 purchase를 다시 쏘지 않는다 —
 * 중복 conversion 방지.
 */

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cart/store";
import { trackPurchase } from "@/lib/analytics";

interface Props {
  orderNo: string;
  amount: number;
  /** 멱등 재진입 시 true. 이미 발사된 purchase 재발사 방지. */
  idempotent?: boolean;
}

export function SuccessClient({ orderNo, amount, idempotent }: Props) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // 멱등 재진입(이미 처리된 결제)이면 conversion 발사 X.
    if (!idempotent) {
      // 카트가 비어 있더라도 amount는 보장됨. items 없으면 빈 배열로.
      const ecomItems = items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      trackPurchase(orderNo, ecomItems, amount);
    }
    clear();
  }, [orderNo, amount, idempotent, items, clear]);

  return null;
}
