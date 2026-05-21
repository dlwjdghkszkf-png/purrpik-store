"use client";

/**
 * Stage 14 — PDP view 시 GA4 view_item + Meta Pixel ViewContent 발사.
 *
 * Server Component PDP에 끼워 넣을 thin client 트리거. 렌더는 null.
 * product.id/name/price 변경 시에만 재발사 (route 재진입 시 자연스럽게 fire).
 *
 * consent='accepted'가 아니면 AnalyticsLoader가 gtag/fbq를 로드하지 않으므로
 * 여기서 추가 가드 없이 noop으로 떨어진다.
 */

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export function ViewItemTracker({ product }: Props) {
  useEffect(() => {
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: 1,
    });
  }, [product.id, product.name, product.price]);

  return null;
}
