/**
 * GET /api/alimtalk/retry
 * Stage 13 — Vercel Cron `*​/5 * * * *` (5분 간격).
 *
 * paid status인데 alimtalk_sent_at IS NULL 이고 attempts < MAX_ATTEMPTS 인 주문에
 * 알림톡 재발송. Stage 9 idx_orders_alimtalk partial index 활용.
 *
 * 인증: Vercel Cron이 자동으로 `Authorization: Bearer ${CRON_SECRET}` 헤더 추가.
 * CRON_SECRET 미설정/불일치 → 401 (안전 기본값).
 *
 * 멱등성: 발송 성공 시 alimtalk_sent_at 세팅 → 다음 cron에서 자동 제외.
 * 실패 시 attempts++ → MAX_ATTEMPTS 도달하면 자동 중단.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendAlimtalk } from "@/lib/solapi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 3;
const BATCH_LIMIT = 50; // Vercel function timeout 회피

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "unauthorized" },
    { status: 401 },
  );
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return unauthorized();

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) return unauthorized();

  const supabase = createServiceClient();

  // 발송 실패한 paid orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .is("alimtalk_sent_at", null)
    .lt("alimtalk_attempts", MAX_ATTEMPTS)
    .limit(BATCH_LIMIT);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  if (!orders || orders.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ORDER ?? "";
  let success = 0;
  let failed = 0;

  for (const o of orders) {
    if (!o.buyer_phone || !templateId) {
      // env 미설정이면 attempts만 올려 무한 재시도 방지
      await supabase
        .from("orders")
        .update({
          alimtalk_attempts: (o.alimtalk_attempts ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("order_no", o.order_no);
      failed++;
      continue;
    }

    const res = await sendAlimtalk({
      to: o.buyer_phone,
      templateId,
      variables: {
        주문번호: o.order_no,
        상품명: o.product_id,
        결제금액: o.amount.toLocaleString("ko-KR") + "원",
      },
    });

    await supabase
      .from("orders")
      .update({
        alimtalk_sent_at: res.success ? new Date().toISOString() : null,
        alimtalk_attempts: (o.alimtalk_attempts ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("order_no", o.order_no);

    if (res.success) success++;
    else failed++;
  }

  return NextResponse.json({
    ok: true,
    processed: orders.length,
    success,
    failed,
  });
}
