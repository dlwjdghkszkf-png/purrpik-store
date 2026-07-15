/**
 * POST /api/naverpay/cart-order
 * 네이버페이 장바구니 [구매하기] 버튼 클릭 → 복수 상품 주문 정보 등록 프록시.
 *
 * 흐름:
 *   1) body { items: [{ productId, variantId?, quantity }] } 검증
 *   2) products 일괄 조회 (RLS, active=true) → 각 SKU 가격/이름 확정
 *   3) 네이버페이 주문 정보 등록 API 호출 (복수 <product>, certiKey는 서버에서만 사용)
 *   4) 성공 시 { key, merchantNo } 반환 — 버튼 SDK(orderRegistrationVersion 2.1) 기대 형식
 *
 * 보안: certiKey/merchantId는 lib/naverpay.ts(서버전용)에서만 접근, 클라이언트 미노출.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseVariants, editionLabel } from "@/lib/products/format";
import {
  registerNaverPayCartOrder,
  type NaverPayOrderInput,
} from "@/lib/naverpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

interface CartItemBody {
  productId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}
interface CartOrderBody {
  items?: unknown;
}

export async function POST(req: NextRequest) {
  let body: CartOrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "장바구니가 비어있습니다" }, { status: 400 });
  }

  // 정규화 + (productId+variantId)로 수량 합산 — 중복 라인이 중복 <product>로 나가지 않도록.
  const agg = new Map<
    string,
    { productId: string; variantId: string; quantity: number }
  >();
  for (const it of body.items as CartItemBody[]) {
    const productId = typeof it.productId === "string" ? it.productId : "";
    if (!productId) continue;
    const variantId = typeof it.variantId === "string" ? it.variantId : "";
    const q = clampQty(it.quantity);
    const key = `${productId}::${variantId}`;
    const prev = agg.get(key);
    agg.set(
      key,
      prev
        ? { ...prev, quantity: Math.min(999, prev.quantity + q) }
        : { productId, variantId, quantity: q },
    );
  }
  const requested = [...agg.values()];

  if (requested.length === 0) {
    return NextResponse.json({ error: "유효한 상품이 없습니다" }, { status: 400 });
  }

  const productIds = [...new Set(requested.map((it) => it.productId))];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("active", true);

  if (error || !data) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  const byId = new Map(data.map((p) => [p.id, p]));

  const inputs: NaverPayOrderInput[] = [];
  for (const it of requested) {
    const product = byId.get(it.productId);
    // 요청 상품 중 하나라도 없거나 비활성이면 부분 주문 대신 전체 거부.
    if (!product) {
      return NextResponse.json(
        { error: "장바구니에 주문 불가 상품이 포함되어 있습니다" },
        { status: 409 },
      );
    }

    const variants = parseVariants(product.variants);
    const sku = variants?.skus.find((s) => s.id === it.variantId);
    // 옵션(SKU) 있는 상품인데 유효 variantId가 아니면 거부.
    const hasSkus = (variants?.skus?.length ?? 0) > 0;
    if (hasSkus && !sku) {
      return NextResponse.json(
        { error: "유효하지 않은 옵션(variantId)이 포함되어 있습니다" },
        { status: 400 },
      );
    }

    const price = sku?.price ?? product.price;
    const skuLabel = sku
      ? sku.edition
        ? `${editionLabel(sku.edition)} ${sku.size}`
        : sku.size
      : null;
    const name = skuLabel ? `${product.name} (${skuLabel})` : product.name;

    inputs.push({
      productId: sku?.id ?? product.id,
      name,
      basePrice: price,
      quantity: it.quantity,
      infoUrl: `${BASE_URL}/shop/${product.id}`,
      imageUrl: product.hero_image
        ? `${BASE_URL}${product.hero_image}`
        : `${BASE_URL}/images/products/placeholder.jpg`,
      backUrl: `${BASE_URL}/cart`,
    });
  }

  const result = await registerNaverPayCartOrder(inputs, `${BASE_URL}/cart`);

  if (!result.ok || !result.key) {
    console.error("[naverpay/cart-order] register failed:", result.error);
    return NextResponse.json(
      { error: result.error ?? "주문 등록 실패" },
      { status: 502 },
    );
  }

  // merchantNo는 등록 응답값을 그대로 전달(없을 때만 센터ID 폴백).
  return NextResponse.json({
    key: result.key,
    merchantNo: result.merchantNo ?? process.env.NAVERPAY_CENTER_ID,
  });
}

/** 유효 정수 수량(1~999) 클램프. Infinity/음수/소수/비수치 방어. */
function clampQty(q: unknown): number {
  const n = typeof q === "number" ? q : 1;
  return Number.isFinite(n) ? Math.min(999, Math.max(1, Math.floor(n))) : 1;
}
