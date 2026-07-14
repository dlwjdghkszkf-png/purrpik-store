"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPendingOrder } from "@/app/checkout/actions";
import type { TossOrderInfo } from "./TossWidget";

/**
 * 무통장입금 주문 — PG 없이 order(pending, bank_transfer) 생성 후 계좌 안내로 이동.
 * 입금 확인은 관리자 수동(주문 status pending → paid).
 */
export function BankTransferPanel({
  amount,
  ready,
  orderInfo,
}: {
  amount: number;
  ready: boolean;
  orderInfo: TossOrderInfo;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOrder() {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    const created = await createPendingOrder({
      orderId: orderInfo.orderId,
      productId: orderInfo.productId,
      variantId: orderInfo.variantId ?? null,
      quantity: orderInfo.quantity,
      amount,
      paymentMethod: "bank_transfer",
      buyer: {
        name: orderInfo.customerName,
        phone: orderInfo.customerMobilePhone ?? "",
        email: orderInfo.customerEmail ?? "",
      },
      ship: orderInfo.ship,
    });
    if (!created.ok) {
      setError(created.error ?? "주문 등록에 실패했습니다.");
      setSubmitting(false);
      return;
    }
    // 장바구니 비우기는 완료 페이지(ClearCartOnMount)에서 — 여기서 비우면
    // 체크아웃의 빈 장바구니 리다이렉트와 경쟁해 /cart로 튕긴다.
    router.push(
      `/order/bank-transfer?orderId=${encodeURIComponent(orderInfo.orderId)}`,
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleOrder}
        disabled={!ready || submitting}
        className="w-full rounded-md bg-ink py-3.5 font-semibold text-white transition disabled:opacity-40"
      >
        {submitting
          ? "주문 접수 중…"
          : `무통장입금으로 주문 · ${amount.toLocaleString()}원`}
      </button>
      {!ready && (
        <p className="text-xs text-mute-2">배송지 정보를 먼저 입력해주세요.</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] leading-relaxed text-mute-2">
        주문 후 안내되는 계좌로 입금하시면 확인 뒤 발송됩니다. 입금자명은 주문자명과
        같게 해주세요.
      </p>
    </div>
  );
}
