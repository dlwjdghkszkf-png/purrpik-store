/**
 * POST /api/naverpay/order
 * 네이버페이 [구매하기] 버튼 클릭 → 주문 정보 등록 프록시.
 *
 * 흐름:
 *   1) body { productId, variantId, quantity } 검증
 *   2) products 조회 (RLS, active=true) → SKU 가격/이름 확정
 *   3) 네이버페이 주문 정보 등록 API 호출 (certiKey는 서버에서만 사용)
 *   4) 성공 시 { key, merchantNo } 반환 — 버튼 SDK(orderRegistrationVersion 2.1)가 기대하는 형식
 *
 * 보안: certiKey/merchantId는 lib/naverpay.ts(서버전용)에서만 접근, 클라이언트 미노출.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseVariants, editionLabel } from "@/lib/products/format";
import { registerNaverPayOrder } from "@/lib/naverpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

interface OrderBody {
  productId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}

export async function POST(req: NextRequest) {
  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId : "";
  const variantId = typeof body.variantId === "string" ? body.variantId : "";
  // 유효 정수만 허용 + 네이버페이 허용 범위(1~999)로 클램프. Infinity/음수/소수 방어.
  const rawQty = typeof body.quantity === "number" ? body.quantity : 1;
  const quantity = Number.isFinite(rawQty)
    ? Math.min(999, Math.max(1, Math.floor(rawQty)))
    : 1;

  if (!productId) {
    return NextResponse.json({ error: "productId 누락" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .limit(1);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
  }
  const product = data[0];
  const variants = parseVariants(product.variants);
  const sku = variants?.skus.find((s) => s.id === variantId);

  // 옵션(SKU) 있는 상품인데 유효한 variantId가 아니면 거부 — 잘못된 가격/SKU 등록 방지.
  const hasSkus = (variants?.skus?.length ?? 0) > 0;
  if (hasSkus && !sku) {
    return NextResponse.json(
      { error: "유효하지 않은 옵션(variantId)입니다" },
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

  const result = await registerNaverPayOrder({
    productId: sku?.id ?? product.id,
    name,
    basePrice: price,
    quantity,
    infoUrl: `${BASE_URL}/shop/${product.id}`,
    imageUrl: product.hero_image
      ? `${BASE_URL}${product.hero_image}`
      : `${BASE_URL}/images/products/placeholder.jpg`,
    backUrl: `${BASE_URL}/shop/${product.id}`,
  });

  if (!result.ok || !result.key) {
    console.error("[naverpay/order] register failed:", result.error);
    return NextResponse.json(
      { error: result.error ?? "주문 등록 실패" },
      { status: 502 },
    );
  }

  // orderRegistrationVersion '2.1' 버튼 SDK가 기대하는 반환 형식.
  // merchantNo는 등록 응답값을 그대로 전달(응답에 없을 때만 센터ID 폴백).
  return NextResponse.json({
    key: result.key,
    merchantNo: result.merchantNo ?? process.env.NAVERPAY_CENTER_ID,
  });
}
