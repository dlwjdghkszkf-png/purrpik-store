import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { BANK_INFO, BANK_CONFIGURED, BANK_DEADLINE_DAYS } from "@/lib/bank";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export const metadata: Metadata = {
  title: "무통장입금 안내",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function BankTransferPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  // P1-6: 실제 존재하는 무통장 주문일 때만 성공 화면 + 카트 비우기.
  // 임의 orderId로 직접 진입해 카트가 지워지거나 가짜 성공을 보는 것 차단.
  // 조회 실패(순단)는 throw → 404가 아니라 error 경계.
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("amount, buyer_name, payment_method")
    .eq("order_no", orderId)
    .limit(1);
  if (error) {
    throw new Error(`[bank-transfer] order lookup failed: ${error.message}`);
  }
  const order = data?.[0] ?? null;
  // 미존재하거나 무통장 주문이 아니면 성공 화면을 띄우지 않는다.
  if (!order || order.payment_method !== "bank_transfer") {
    notFound();
  }

  return (
    <div className="container-page max-w-xl py-16">
      <ClearCartOnMount />
      <div className="rounded-2xl border border-line p-8 text-center">
        <div className="text-4xl">🧾</div>
        <h1 className="mt-4 text-2xl font-bold">주문이 접수됐어요</h1>
        <p className="mt-2 text-small text-mute-1">
          아래 계좌로 입금해주시면 확인 후 발송됩니다.
        </p>

        <dl className="mt-8 space-y-3 rounded-xl bg-zinc-50 p-6 text-left text-small">
          <div className="flex justify-between gap-3">
            <dt className="text-mute-2">주문번호</dt>
            <dd className="font-medium tabular-nums">{orderId}</dd>
          </div>
          {order && (
            <div className="flex justify-between gap-3">
              <dt className="text-mute-2">입금 금액</dt>
              <dd className="text-base font-bold text-ink tabular-nums">
                {order.amount.toLocaleString()}원
              </dd>
            </div>
          )}
          {BANK_CONFIGURED ? (
            <>
              <div className="flex justify-between gap-3">
                <dt className="text-mute-2">입금 계좌</dt>
                <dd className="font-medium">
                  {BANK_INFO.bank} {BANK_INFO.account}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-mute-2">예금주</dt>
                <dd className="font-medium">{BANK_INFO.holder}</dd>
              </div>
            </>
          ) : (
            <div className="text-mute-1">
              입금 계좌는 곧 문자·이메일로 안내드립니다.
            </div>
          )}
        </dl>

        <ul className="mt-6 space-y-1.5 text-left text-xs text-mute-2">
          <li>
            · 입금자명은{" "}
            <b className="text-ink">{order?.buyer_name ?? "주문자명"}</b>과
            같게 해주세요.
          </li>
          <li>· {BANK_DEADLINE_DAYS}일 내 미입금 시 주문이 취소될 수 있습니다.</li>
          <li>· 입금 확인 후 배송이 시작됩니다 (영업일 기준).</li>
        </ul>

        <div className="mt-8 flex gap-3">
          <Link
            href="/orders/lookup"
            className="flex-1 rounded-md border border-line py-3 text-small font-medium hover:border-ink"
          >
            주문 조회
          </Link>
          <Link
            href="/shop"
            className="flex-1 rounded-md bg-brand-mustard py-3 text-small font-semibold text-white hover:bg-brand-mustard-deep"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
