/**
 * POST /api/payments/confirm
 * Stage 9 — Toss 결제 승인 + 알림톡 발송.
 *
 * 흐름 (spec sec 5):
 *   1) body { paymentKey, orderId, amount } 검증
 *   2) orders lookup (toss_order_id = orderId)
 *   3) 멱등성: status='paid'면 Toss 미호출, 200 idempotent
 *   4) amount 검증 (DB amount === body.amount) — 위변조 차단
 *   5) Toss confirmPayment
 *   6) orders UPDATE { status:'paid', toss_payment_key, toss_paid_at }
 *   7) 솔라피 알림톡 — 실패해도 200 (Cron 재시도)
 *
 * 보안: service role 사용. CSRF는 결제 흐름 특성상 paymentKey 자체가 nonce — 별도 토큰 X.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmPayment, TossError } from "@/lib/toss";
import { sendAlimtalk } from "@/lib/solapi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConfirmBody {
  paymentKey?: unknown;
  orderId?: unknown;
  amount?: unknown;
}

async function notifyAdmin(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `[푸르픽 자사몰 결제 알림] ${JSON.stringify(payload)}`,
      }),
    });
  } catch {
    // 알림 실패는 무시 — 결제 흐름 차단 금지.
  }
}

export async function POST(req: NextRequest) {
  // 1. body 파싱
  let raw: ConfirmBody;
  try {
    raw = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const paymentKey =
    typeof raw.paymentKey === "string" ? raw.paymentKey : null;
  const orderId = typeof raw.orderId === "string" ? raw.orderId : null;
  const amount = typeof raw.amount === "number" ? raw.amount : null;

  if (!paymentKey || !orderId || amount === null || !Number.isFinite(amount)) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }

  // env 미설정 — graceful degrade.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { ok: false, error: "env_missing" },
      { status: 503 },
    );
  }

  const supabase = createServiceClient();

  // 2. orders lookup
  const { data: order, error: dbErr } = await supabase
    .from("orders")
    .select(
      "id, order_no, product_id, amount, status, buyer_phone, alimtalk_attempts",
    )
    .eq("toss_order_id", orderId)
    .single();

  if (dbErr || !order) {
    await notifyAdmin({
      kind: "order_not_found",
      orderId,
      dbError: dbErr?.message,
    });
    return NextResponse.json(
      { ok: false, error: "order_not_found" },
      { status: 404 },
    );
  }

  // 3. 멱등성 — 이미 paid면 Toss 미호출, 성공 반환.
  if (order.status === "paid") {
    return NextResponse.json({
      ok: true,
      orderNo: order.order_no,
      idempotent: true,
    });
  }

  // 4. amount 검증 (위변조 차단)
  if (order.amount !== amount) {
    await notifyAdmin({
      kind: "amount_mismatch",
      orderId,
      orderNo: order.order_no,
      expected: order.amount,
      got: amount,
    });
    return NextResponse.json(
      { ok: false, error: "amount_mismatch" },
      { status: 401 },
    );
  }

  // 5. Toss confirm
  let tossRes;
  try {
    tossRes = await confirmPayment({ paymentKey, orderId, amount });
  } catch (e) {
    if (e instanceof TossError) {
      await notifyAdmin({
        kind: "toss_error",
        orderId,
        orderNo: order.order_no,
        code: e.code,
        message: e.message,
        statusCode: e.statusCode,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "toss_failed",
          code: e.code,
          message: e.message,
        },
        { status: 502 },
      );
    }
    await notifyAdmin({
      kind: "toss_unknown",
      orderId,
      orderNo: order.order_no,
      error: (e as Error).message,
    });
    return NextResponse.json(
      { ok: false, error: "toss_unknown" },
      { status: 500 },
    );
  }

  // 6. DB UPDATE — status=paid + Toss 메타
  const paidAt = tossRes.approvedAt ?? new Date().toISOString();
  const { error: updErr } = await supabase
    .from("orders")
    .update({
      status: "paid",
      toss_payment_key: paymentKey,
      toss_paid_at: paidAt,
      updated_at: new Date().toISOString(),
    })
    .eq("toss_order_id", orderId);

  if (updErr) {
    // Toss는 이미 승인 — 수동 복구 필요.
    await notifyAdmin({
      kind: "db_update_failed",
      orderId,
      orderNo: order.order_no,
      paymentKey,
      error: updErr.message,
    });
    return NextResponse.json(
      { ok: false, error: "db_update_failed" },
      { status: 500 },
    );
  }

  // 7. 알림톡 발송 — 실패해도 결제는 OK.
  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ORDER ?? "";
  if (templateId && order.buyer_phone) {
    const alim = await sendAlimtalk({
      to: order.buyer_phone,
      templateId,
      variables: {
        주문번호: order.order_no,
        상품명: order.product_id,
        결제금액: `${order.amount.toLocaleString("ko-KR")}원`,
      },
    });

    await supabase
      .from("orders")
      .update({
        alimtalk_sent_at: alim.success ? new Date().toISOString() : null,
        alimtalk_attempts: alim.success
          ? (order.alimtalk_attempts ?? 0) + 1
          : (order.alimtalk_attempts ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("toss_order_id", orderId);

    if (!alim.success) {
      await notifyAdmin({
        kind: "alimtalk_failed",
        orderId,
        orderNo: order.order_no,
        error: alim.error,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    orderNo: order.order_no,
    method: tossRes.method,
    approvedAt: paidAt,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 },
  );
}
