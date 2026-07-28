"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface LookupOrderItem {
  product_name: string;
  variant_label: string | null;
  quantity: number;
  line_total: number;
}

export interface LookupResult {
  ok: boolean;
  error?: string;
  order?: OrderRow & {
    product?: Pick<ProductRow, "id" | "name"> | null;
    items?: LookupOrderItem[];
  };
}

function normalizePhone(p: string): string {
  return p.replace(/[^0-9]/g, "");
}

/**
 * 비회원 주문 조회.
 * 매칭 기준: order_no + buyer_email + buyer_phone 끝 4자리.
 *
 * 보안 노트: phoneTail 4자리만 검증 — 풀 번호 노출 X, 무작위 대입 가능성은
 * order_no가 PP-prefix + 충분한 엔트로피라 실질적 위험 낮음. 추후 rate-limit
 * 추가 권고 (Stage 12+).
 */
export async function lookupOrder(formData: FormData): Promise<LookupResult> {
  const orderNo = String(formData.get("orderNo") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phoneTail = normalizePhone(
    String(formData.get("phoneTail") ?? "").trim(),
  );

  if (!orderNo || !email || !phoneTail) {
    return { ok: false, error: "모든 항목을 입력해주세요." };
  }
  if (phoneTail.length !== 4) {
    return { ok: false, error: "휴대폰 끝 4자리를 정확히 입력해주세요." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      ok: false,
      error: "주문 조회 서비스가 준비되지 않았습니다. (env 미설정)",
    };
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_no", orderNo)
      .eq("buyer_email", email)
      .like("buyer_phone", `%${phoneTail}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("[lookupOrder] select error:", error.message);
      return { ok: false, error: "주문을 찾을 수 없습니다. 정보를 다시 확인해주세요." };
    }
    if (!data) {
      return { ok: false, error: "주문을 찾을 수 없습니다. 정보를 다시 확인해주세요." };
    }

    // 상품명 조회 (실패해도 조용히 무시)
    let product: Pick<ProductRow, "id" | "name"> | null = null;
    if (data.product_id) {
      const { data: p } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", data.product_id)
        .maybeSingle();
      product = p ?? null;
    }

    // P0-2 — 라인 상세 (구주문엔 없을 수 있음 → 헤더 표시로 fallback)
    let items: LookupOrderItem[] = [];
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("product_name, variant_label, quantity, line_total")
      .eq("order_id", data.id)
      .order("created_at", { ascending: true });
    items = itemRows ?? [];

    return { ok: true, order: { ...data, product, items } };
  } catch (e) {
    console.warn("[lookupOrder] exception:", (e as Error).message);
    return { ok: false, error: "주문 조회 중 오류가 발생했습니다." };
  }
}
