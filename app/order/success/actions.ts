"use server";

/**
 * Stage 10 — /order/success에서 호출하는 server action.
 * Toss redirect 직후 mount된 클라이언트가 confirm을 트리거한다.
 *
 * 직접 confirmPayment를 호출할 수도 있지만 route handler를 단일 진실로 두기 위해
 * 동일 origin으로 fetch — 멱등성 보장 + 추후 webhook 통합 시에도 단일 코드 경로.
 */

import { headers } from "next/headers";

export interface ConfirmActionResult {
  ok: boolean;
  orderNo?: string;
  idempotent?: boolean;
  error?: string;
  code?: string;
  message?: string;
}

export async function confirmOrderAction(input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<ConfirmActionResult> {
  if (!input.paymentKey || !input.orderId || !Number.isFinite(input.amount)) {
    return { ok: false, error: "missing_fields" };
  }

  // Origin 결정 — Vercel/로컬 양쪽 대응.
  const h = await headers();
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  try {
    const res = await fetch(`${baseUrl}/api/payments/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as ConfirmActionResult;
    return data;
  } catch (e) {
    return {
      ok: false,
      error: "network_error",
      message: (e as Error).message,
    };
  }
}
