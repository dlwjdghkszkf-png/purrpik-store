"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupOrder, type LookupResult } from "./actions";
import { statusLabel } from "./status";

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatKRW(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function LookupClient() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await lookupOrder(fd);
      setResult(r);
    });
  }

  const order = result?.ok ? result.order : undefined;
  const status = order?.status;

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="orderNo">주문번호</Label>
          <Input
            id="orderNo"
            name="orderNo"
            placeholder="PP-XXXXXXXXXX"
            required
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="결제 시 입력한 이메일"
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phoneTail">휴대폰 끝 4자리</Label>
          <Input
            id="phoneTail"
            name="phoneTail"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="0000"
            required
          />
        </div>
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "조회 중..." : "주문 조회"}
        </Button>
        {result && !result.ok && (
          <p className="text-small text-red-600">{result.error}</p>
        )}
      </form>

      {order && status && (
        <section className="mt-8 rounded-lg border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-small text-mute-2">주문번호</p>
              <p className="mt-1 text-base font-semibold">{order.order_no}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-small font-medium text-ink">
              {statusLabel(status)}
            </span>
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <p className="text-small font-semibold text-mute-1">상품</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-base">
                {order.product?.name ?? order.product_id}
                <span className="ml-2 text-small text-mute-2">
                  × {order.quantity}
                </span>
              </p>
              <p className="text-base font-semibold">
                {formatKRW(order.amount)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <p className="text-small font-semibold text-mute-1">배송지</p>
            <p className="mt-2 text-small text-mute-1">
              [{order.ship_zipcode}] {order.ship_address1}
              {order.ship_address2 ? ` ${order.ship_address2}` : ""}
            </p>
            {order.ship_memo && (
              <p className="mt-1 text-small text-mute-2">
                메모: {order.ship_memo}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4 text-small">
            <div>
              <p className="text-mute-2">결제일</p>
              <p className="mt-1 text-ink">{formatDateTime(order.created_at)}</p>
            </div>
            <div>
              <p className="text-mute-2">알림톡 발송</p>
              <p className="mt-1 text-ink">
                {order.alimtalk_sent_at
                  ? formatDateTime(order.alimtalk_sent_at)
                  : "미발송"}
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
