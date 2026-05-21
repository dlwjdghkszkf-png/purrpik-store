/**
 * GET /api/orders/cleanup
 * Stage 13 — Vercel Cron `0 3 * * *` (매일 새벽 3시).
 *
 * 24시간 경과한 pending 주문 → cancelled 처리.
 * 결제 미완료 주문이 무한히 적체되는 것을 방지.
 *
 * 인증: Vercel Cron `Authorization: Bearer ${CRON_SECRET}`.
 * 멱등성: WHERE status='pending' 이라 두 번 돌려도 같은 행 두 번 cancelled 안 됨.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CUTOFF_HOURS = 24;

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
  const cutoff = new Date(
    Date.now() - CUTOFF_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("order_no");

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    cancelled: data?.length ?? 0,
    cutoff,
  });
}
