"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface CreatePendingOrderInput {
  orderId: string; // toss orderId == 우리 order_no
  productId: string; // 첫 카트 item의 product id (MVP: 단일 product_id 매핑)
  /** Stage 18 — 첫 카트 item의 variant id (SKU). 단일 product면 null. */
  variantId?: string | null;
  quantity: number; // 첫 item 수량 (대표값)
  amount: number; // 카트 합계
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
  error?: string;
}

/**
 * Pending order INSERT.
 * 호출 시점: TossWidget 결제 버튼 클릭 → requestPayment 호출 직전.
 *
 * 보안: service role 클라이언트 사용 (RLS bypass). client → server action 경유.
 * 검증: 금액·이메일·전화번호 형식 (간단). 본격 검증은 Stage 9 결제 confirm에서.
 */
export async function createPendingOrder(
  input: CreatePendingOrderInput,
): Promise<CreatePendingOrderResult> {
  if (!input.orderId || !input.productId || input.amount <= 0) {
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

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("orders").insert({
      order_no: input.orderId,
      product_id: input.productId,
      variant_id: input.variantId ?? null,
      quantity: input.quantity,
      amount: input.amount,
      status: "pending",
      toss_order_id: input.orderId,
      buyer_name: input.buyer.name,
      buyer_phone: input.buyer.phone,
      buyer_email: input.buyer.email || null,
      ship_zipcode: input.ship.zipcode,
      ship_address1: input.ship.address1,
      ship_address2: input.ship.address2 || null,
      ship_memo: input.ship.memo ?? null,
    });
    if (error) {
      console.warn("[createPendingOrder] insert error:", error.message);
      return { ok: false, error: "주문 등록에 실패했습니다." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[createPendingOrder] exception:", (e as Error).message);
    return { ok: false, error: "주문 등록 중 오류가 발생했습니다." };
  }
}
