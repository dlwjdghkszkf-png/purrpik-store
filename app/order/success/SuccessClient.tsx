"use client";

/**
 * /order/success의 클라이언트 사이드 작업:
 *   - 카트 clear (결제 완료)
 *   - GA4 + Meta Pixel `purchase` event (Stage 14 wiring 대기, 지금은 stub)
 */

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

interface Props {
  orderNo: string;
  amount: number;
}

export function SuccessClient({ orderNo, amount }: Props) {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
    // TODO Stage 14: analytics
    // window.gtag?.('event', 'purchase', { transaction_id: orderNo, value: amount, currency: 'KRW' });
    // window.fbq?.('track', 'Purchase', { value: amount, currency: 'KRW' });
    void orderNo;
    void amount;
  }, [clear, orderNo, amount]);

  return null;
}
