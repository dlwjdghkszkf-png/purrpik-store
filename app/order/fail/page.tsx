/**
 * /order/fail — Toss fail URL redirect 목적지.
 * Stage 10.
 *
 * Toss는 query로 code / message / orderId 전달.
 * 결제 자체가 진행되지 않은 상태 — pending order는 Cron이 정리.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "결제 실패 — 푸르픽",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    code?: string | string[];
    message?: string | string[];
    orderId?: string | string[];
  }>;
}

function pickString(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

/** 자주 발생하는 Toss 에러 코드 — 일반 사용자 안내. */
const FRIENDLY_HINTS: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제를 취소하셨어요. 다시 시도하시려면 아래 버튼을 눌러주세요.",
  PAY_PROCESS_ABORTED: "결제가 중단되었습니다. 잠시 후 다시 시도해 주세요.",
  REJECT_CARD_COMPANY: "카드사에서 결제를 거부했습니다. 카드사에 문의하거나 다른 결제수단을 이용해 주세요.",
  EXCEED_MAX_DAILY_PAYMENT_COUNT: "오늘 결제 한도를 초과했습니다. 내일 다시 시도하거나 다른 카드를 이용해 주세요.",
  INVALID_CARD_EXPIRATION: "카드 유효기간이 올바르지 않습니다.",
  NOT_ENOUGH_BALANCE: "잔액이 부족합니다. 다른 카드 또는 결제수단을 이용해 주세요.",
  EXCEED_MAX_PAYMENT_AMOUNT: "결제 금액 한도를 초과했습니다.",
  INVALID_STOPPED_CARD: "정지된 카드입니다. 다른 카드를 이용해 주세요.",
};

export default async function OrderFailPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const code = pickString(sp.code);
  const message = pickString(sp.message);
  const orderId = pickString(sp.orderId);

  const hint = (code && FRIENDLY_HINTS[code]) || null;

  return (
    <main className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-700" aria-hidden />
        </div>
        <h1 className="mt-6">결제가 완료되지 않았습니다</h1>

        {hint ? (
          <p className="mt-3 text-mute-1">{hint}</p>
        ) : (
          <p className="mt-3 text-mute-1">
            {message || "결제 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요."}
          </p>
        )}

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
            {code && message && hint && (
              <div className="mt-1 text-mute-2">
                상세: {message}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 rounded-lg border border-line bg-white px-6 py-4 text-left text-xs text-mute-1">
          <p className="font-medium text-ink">자주 발생하는 원인</p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            <li>카드 잔액 또는 한도 부족</li>
            <li>카드 유효기간 만료 / 정지된 카드</li>
            <li>결제 도중 창을 닫거나 네트워크가 끊김</li>
            <li>일일 결제 한도 초과</li>
          </ul>
        </div>

        <p className="mt-4 text-xs text-mute-2">
          결제가 두 번 청구된 것 같다면 영업일 기준 2~3일 안에 자동 취소되며,
          확실치 않으시면 고객센터로 문의해 주세요.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/cart">장바구니로 돌아가기</Link>
          </Button>
          <Button asChild variant="mustard" size="lg">
            <Link href="/checkout">다시 결제하기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
