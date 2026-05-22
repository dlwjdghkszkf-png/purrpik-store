"use client";

import { useEffect, useRef, useState } from "react";
import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { createPendingOrder } from "@/app/checkout/actions";

export interface TossOrderInfo {
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  productId: string;
  /** Stage 18 — 첫 카트 라인의 SKU id (있을 때만). */
  variantId?: string | null;
  quantity: number;
  ship: {
    zipcode: string;
    address1: string;
    address2: string;
    memo?: string;
  };
}

interface Props {
  amount: number;
  ready: boolean; // AddressForm + 필수약관 완료 여부
  orderInfo: TossOrderInfo;
}

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

export function TossWidget({ amount, ready, orderInfo }: Props) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // env 없으면 placeholder만 렌더.
  const envReady = CLIENT_KEY.length > 0;

  // 위젯 mount — env 있을 때만, 마운트 1회.
  useEffect(() => {
    if (!envReady) return;
    let cancelled = false;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        if (cancelled) return;
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: "KRW", value: amount });
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-widget",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        if (!cancelled) setMounted(true);
      } catch (e) {
        console.error("[TossWidget] init failed:", e);
        if (!cancelled) {
          setError("결제 위젯을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // amount 변경 시 setAmount만 재호출하는 별도 effect에서 처리.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envReady]);

  // 금액 변경 시 setAmount 갱신.
  useEffect(() => {
    if (!widgetsRef.current || !mounted) return;
    widgetsRef.current.setAmount({ currency: "KRW", value: amount }).catch(
      (e: unknown) => console.warn("[TossWidget] setAmount failed:", e),
    );
  }, [amount, mounted]);

  const handlePay = async () => {
    if (!widgetsRef.current || !envReady) return;
    setError(null);
    setLoading(true);
    try {
      // 1. Pending order INSERT (server action)
      const created = await createPendingOrder({
        orderId: orderInfo.orderId,
        productId: orderInfo.productId,
        variantId: orderInfo.variantId ?? null,
        quantity: orderInfo.quantity,
        amount,
        buyer: {
          name: orderInfo.customerName,
          phone: orderInfo.customerMobilePhone ?? "",
          email: orderInfo.customerEmail ?? "",
        },
        ship: orderInfo.ship,
      });

      if (!created.ok) {
        setError(created.error ?? "주문 등록에 실패했습니다.");
        setLoading(false);
        return;
      }

      // 2. Toss 결제창 호출 — 성공 시 success URL로 리다이렉트.
      const origin = window.location.origin;
      await widgetsRef.current.requestPayment({
        orderId: orderInfo.orderId,
        orderName: orderInfo.orderName,
        successUrl: `${origin}/order/success`,
        failUrl: `${origin}/order/fail`,
        customerName: orderInfo.customerName,
        customerEmail: orderInfo.customerEmail || undefined,
        customerMobilePhone: orderInfo.customerMobilePhone || undefined,
      });
      // requestPayment는 결제창으로 리다이렉트 → 이 이후 코드는 보통 실행 안 됨.
    } catch (e) {
      const msg = (e as { message?: string }).message ?? "결제 요청 중 오류가 발생했습니다.";
      console.warn("[TossWidget] requestPayment error:", e);
      setError(msg);
      setLoading(false);
    }
  };

  if (!envReady) {
    return (
      <section className="rounded-lg border border-dashed border-line bg-secondary/30 p-6 text-center">
        <p className="text-sm text-mute-1">
          결제 시스템 준비 중입니다.
        </p>
        <p className="mt-1 text-xs text-mute-2">
          (관리자: <code>NEXT_PUBLIC_TOSS_CLIENT_KEY</code> 환경변수 설정 후 동작)
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="text-lg font-bold text-ink mb-5">결제 수단</h2>

      <div id="payment-widget" className="min-h-[200px]" />
      <div id="agreement" className="mt-5" />

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="mustard"
        size="lg"
        className="mt-6 w-full h-12 text-base"
        disabled={!ready || !mounted || loading}
        onClick={handlePay}
      >
        {loading ? "결제 진행 중…" : "결제하기"}
      </Button>

      {!ready && mounted && (
        <p className="mt-3 text-xs text-mute-1 text-center">
          배송지 정보와 필수 약관에 동의하면 결제할 수 있습니다.
        </p>
      )}
    </section>
  );
}
