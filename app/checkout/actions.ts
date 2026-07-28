"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  priceCheckout,
  type CheckoutLineInput,
} from "@/lib/checkout/pricing";

export interface CreatePendingOrderInput {
  orderId: string; // toss orderId == 우리 order_no
  /** 카트 전체 라인 — 가격은 보내지 않는다. 서버가 카탈로그에서 재계산. */
  lines: CheckoutLineInput[];
  /** 'card' = 토스 카드결제 / 'bank_transfer' = 무통장입금. 기본 card. */
  paymentMethod?: "card" | "bank_transfer";
  buyer: { name: string; phone: string; email: string };
  ship: {
    zipcode: string;
    address1: string;
    address2: string;
    memo?: string;
  };
}

export interface CreatePendingOrderResult {
  ok: boolean;
  /** 서버 계산 결제 금액 — 클라이언트는 이 값으로 결제 위젯 금액을 맞춘다. */
  amount?: number;
  orderName?: string;
  error?: string;
}

/**
 * Pending order INSERT.
 * 호출 시점: 결제 버튼 클릭 → requestPayment/무통장 안내 이동 직전.
 *
 * P0-1: 클라이언트 가격을 신뢰하지 않는다 — priceCheckout()이 DB 카탈로그로
 *       단가·합계를 재계산하고, 그 값만 orders.amount에 저장한다.
 * P0-2: 모든 카트 라인을 order_items에 스냅샷 저장한다.
 *       orders.product_id/variant_id/quantity는 첫 라인 스냅샷(하위 호환).
 */
export async function createPendingOrder(
  input: CreatePendingOrderInput,
): Promise<CreatePendingOrderResult> {
  if (!input.orderId) {
    return { ok: false, error: "주문 정보가 올바르지 않습니다." };
  }
  if (!input.buyer.name || !input.buyer.phone) {
    return { ok: false, error: "구매자 정보가 누락되었습니다." };
  }
  if (!input.ship.zipcode || !input.ship.address1) {
    return { ok: false, error: "배송지 정보가 누락되었습니다." };
  }

  // env가 비어있을 때 — 빌드/dev 환경에서 graceful degrade.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      ok: false,
      error: "결제 환경이 준비되지 않았습니다. (env 미설정)",
    };
  }

  const priced = await priceCheckout(input.lines);
  if (!priced.ok) {
    return { ok: false, error: priced.error };
  }

  try {
    const supabase = createServiceClient();
    const first = priced.lines[0];
    const { data: orderRow, error } = await supabase
      .from("orders")
      .insert({
        order_no: input.orderId,
        product_id: first.productId,
        variant_id: first.variantId,
        quantity: first.quantity,
        amount: priced.total,
        status: "pending",
        toss_order_id: input.orderId,
        buyer_name: input.buyer.name,
        buyer_phone: input.buyer.phone,
        buyer_email: input.buyer.email || null,
        ship_zipcode: input.ship.zipcode,
        ship_address1: input.ship.address1,
        ship_address2: input.ship.address2 || null,
        ship_memo: input.ship.memo ?? null,
        // payment_method는 bank_transfer일 때만 명시 (card는 DB default). 컬럼 미존재 환경서 카드주문 보호.
        ...(input.paymentMethod === "bank_transfer"
          ? { payment_method: "bank_transfer" }
          : {}),
      })
      .select("id")
      .single();
    if (error || !orderRow) {
      console.warn("[createPendingOrder] insert error:", error?.message);
      return { ok: false, error: "주문 등록에 실패했습니다." };
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      priced.lines.map((l) => ({
        order_id: orderRow.id,
        product_id: l.productId,
        variant_id: l.variantId,
        product_name: l.productName,
        variant_label: l.variantLabel,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
      })),
    );
    if (itemsError) {
      // 상세 없는 주문 헤더를 남기지 않는다 — 보상 삭제 후 실패 반환.
      console.error("[createPendingOrder] items insert error:", itemsError.message);
      await supabase.from("orders").delete().eq("id", orderRow.id);
      return { ok: false, error: "주문 등록에 실패했습니다. 다시 시도해주세요." };
    }

    return { ok: true, amount: priced.total, orderName: priced.orderName };
  } catch (e) {
    console.warn("[createPendingOrder] exception:", (e as Error).message);
    return { ok: false, error: "주문 등록 중 오류가 발생했습니다." };
  }
}
