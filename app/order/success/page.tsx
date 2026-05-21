/**
 * /order/success — Toss success URL redirect 목적지.
 * Stage 10.
 *
 * Toss는 query로 paymentKey / orderId / amount를 전달.
 * RSC에서 server action으로 /api/payments/confirm 호출 → 결과 표시.
 *
 * 멱등성: page reload 시에도 안전 (route handler가 status='paid' 체크).
 */

import Link from "next/link";
import type { Metadata } from "next";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmOrderAction } from "./actions";
import { SuccessClient } from "./SuccessClient";

export const metadata: Metadata = {
  title: "결제 완료 — 푸르픽",
  robots: { index: false, follow: false }, // 결제 결과 페이지는 검색 X
};

// 결제 상태는 동적 — 캐시 X.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    paymentKey?: string | string[];
    orderId?: string | string[];
    amount?: string | string[];
  }>;
}

function pickString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "결제 정보가 누락되었습니다.",
  order_not_found: "주문을 찾을 수 없습니다.",
  amount_mismatch: "결제 금액이 일치하지 않습니다.",
  toss_failed: "결제 승인에 실패했습니다.",
  toss_unknown: "결제 처리 중 알 수 없는 오류가 발생했습니다.",
  db_update_failed:
    "결제는 승인되었으나 주문 저장에 실패했습니다. 고객센터로 연락해 주세요.",
  env_missing: "결제 환경이 준비되지 않았습니다.",
  network_error: "결제 서버와의 통신에 실패했습니다.",
  invalid_json: "결제 요청이 올바르지 않습니다.",
};

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const paymentKey = pickString(sp.paymentKey);
  const orderId = pickString(sp.orderId);
  const amountStr = pickString(sp.amount);
  const amount = Number(amountStr);

  // 필수 파라미터 누락 — 비정상 진입.
  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
    return (
      <ErrorState
        title="잘못된 접근입니다"
        message="결제 정보가 올바르지 않습니다. 장바구니에서 다시 결제를 진행해 주세요."
      />
    );
  }

  const result = await confirmOrderAction({ paymentKey, orderId, amount });

  if (!result.ok) {
    const msg =
      (result.error && ERROR_MESSAGES[result.error]) ||
      result.message ||
      "결제 처리 중 오류가 발생했습니다.";
    return (
      <ErrorState
        title="결제 처리에 실패했습니다"
        message={msg}
        code={result.code}
        orderId={orderId}
      />
    );
  }

  return (
    <>
      <SuccessClient
        orderNo={result.orderNo ?? orderId}
        amount={amount}
        idempotent={result.idempotent}
      />
      <main className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-700" aria-hidden />
          </div>
          <h1 className="mt-6">결제가 완료되었습니다</h1>
          <p className="mt-3 text-mute-1">
            주문해 주셔서 감사합니다. 결제 내역과 배송 정보를 카카오 알림톡으로
            보내드렸어요.
          </p>

          <div className="mt-8 rounded-lg border border-line bg-secondary/30 px-6 py-5 text-left">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-mute-2">주문번호</dt>
              <dd className="font-mono font-semibold text-ink">
                {result.orderNo ?? orderId}
              </dd>
              <dt className="text-mute-2">결제금액</dt>
              <dd className="text-ink">{amount.toLocaleString("ko-KR")}원</dd>
              {result.idempotent && (
                <>
                  <dt className="text-mute-2">상태</dt>
                  <dd className="text-mute-1">이미 처리된 결제입니다</dd>
                </>
              )}
            </dl>
          </div>

          <p className="mt-4 text-xs text-mute-2">
            주문번호를 메모해두시면 비회원 주문 조회에 사용하실 수 있어요.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href={`/orders/lookup?orderNo=${result.orderNo ?? orderId}`}>
                주문 상세 보기
              </Link>
            </Button>
            <Button asChild variant="mustard" size="lg">
              <Link href="/shop">쇼핑 계속하기</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

function ErrorState({
  title,
  message,
  code,
  orderId,
}: {
  title: string;
  message: string;
  code?: string;
  orderId?: string;
}) {
  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-8 w-8 text-amber-700" aria-hidden />
        </div>
        <h1 className="mt-6">{title}</h1>
        <p className="mt-3 text-mute-1">{message}</p>

        {(code || orderId) && (
          <div className="mt-6 rounded-lg border border-line bg-secondary/30 px-6 py-4 text-left text-xs text-mute-1">
            {orderId && (
              <div>
                주문번호: <span className="font-mono">{orderId}</span>
              </div>
            )}
            {code && (
              <div className="mt-1">
                오류 코드: <span className="font-mono">{code}</span>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-mute-2">
          결제에 어려움이 있으시면 카카오톡 채널 또는 고객센터로 문의해
          주세요. 결제가 이미 완료된 경우 중복 결제를 방지하기 위해 새로고침
          대신 고객센터 문의를 권장드립니다.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/cart">장바구니로 돌아가기</Link>
          </Button>
          <Button asChild variant="mustard" size="lg">
            <Link href="/shop">쇼핑 계속하기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
