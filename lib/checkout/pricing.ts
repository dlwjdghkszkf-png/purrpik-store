import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import { parseVariants, editionLabel } from "@/lib/products/format";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface CheckoutLineInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PricedCheckout {
  ok: true;
  lines: PricedLine[];
  total: number;
  orderName: string;
}

export interface PricingError {
  ok: false;
  error: string;
}

const MAX_QTY_PER_LINE = 99;
const MAX_LINES = 20;

/**
 * P0-1 (REVIEW_SOL_QA_2026-07-28): 주문 금액의 유일한 진실 = DB 카탈로그.
 * 클라이언트는 { productId, variantId, quantity }만 보내고,
 * 단가·합계·주문명은 전부 여기서 계산한다.
 */
export async function priceCheckout(
  rawLines: CheckoutLineInput[],
): Promise<PricedCheckout | PricingError> {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    return { ok: false, error: "주문 상품이 없습니다." };
  }
  if (rawLines.length > MAX_LINES) {
    return { ok: false, error: "주문 상품 수가 너무 많습니다." };
  }
  for (const l of rawLines) {
    if (
      !l ||
      typeof l.productId !== "string" ||
      !l.productId ||
      !Number.isInteger(l.quantity) ||
      l.quantity < 1 ||
      l.quantity > MAX_QTY_PER_LINE
    ) {
      return { ok: false, error: "주문 상품 정보가 올바르지 않습니다." };
    }
  }

  const productIds = [...new Set(rawLines.map((l) => l.productId))];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("active", true);
  if (error) {
    console.error("[priceCheckout] products fetch error:", error.message);
    return { ok: false, error: "상품 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }
  const byId = new Map<string, ProductRow>((data ?? []).map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  for (const l of rawLines) {
    const product = byId.get(l.productId);
    if (!product) {
      return { ok: false, error: "판매 중이 아닌 상품이 포함되어 있습니다." };
    }
    let unitPrice = product.price;
    let variantLabel: string | null = null;
    const variantId = l.variantId ?? null;
    if (variantId) {
      const variants = parseVariants(product.variants);
      const sku = variants?.skus.find((s) => s.id === variantId);
      if (!sku) {
        return { ok: false, error: "선택한 옵션이 유효하지 않습니다." };
      }
      unitPrice = sku.price;
      variantLabel = `${editionLabel(sku.edition)} · ${sku.size}`;
    }
    if (!Number.isInteger(unitPrice) || unitPrice < 0) {
      return { ok: false, error: "상품 가격 정보가 올바르지 않습니다." };
    }
    lines.push({
      productId: product.id,
      variantId,
      productName: product.name,
      variantLabel,
      unitPrice,
      quantity: l.quantity,
      lineTotal: unitPrice * l.quantity,
    });
  }

  const total = lines.reduce((s, l) => s + l.lineTotal, 0);
  if (total <= 0) {
    return { ok: false, error: "주문 금액이 올바르지 않습니다." };
  }
  const orderName =
    lines.length === 1
      ? lines[0].productName
      : `${lines[0].productName} 외 ${lines.length - 1}건`;

  return { ok: true, lines, total, orderName };
}
