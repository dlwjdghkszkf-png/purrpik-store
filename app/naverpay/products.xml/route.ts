/**
 * GET /naverpay/products.xml
 * 네이버페이 주문형 — 상품정보 XML 피드 (연동 가이드 §3.2 상품 정보 연동).
 *
 * 용도: 네이버페이가 검수/결제검증 시 이 URL을 GET하여 전 상품의 ID/가격/상태를
 * 확인. 여기서 반환하는 상품ID·가격이 주문등록(order/cart-order) 시 보내는 값과
 * 일치해야 결제 검증 통과 → lib/naverpay-catalog.ts 공용 파생으로 parity 보장.
 *
 * 스키마(가이드 §3.2): <products> 루트, 각 <product>에 id/name/basePrice/taxType/
 * infoUrl/imageUrl/status/shippingPolicy. 전상품 무료배송 → shippingPolicy FREE 고정.
 */
import { createClient } from "@/lib/supabase/server";
import {
  productToCatalogEntries,
  naverpayXmlEscape as esc,
  type NaverCatalogEntry,
} from "@/lib/naverpay-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 재고/가격 실시간 반영

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

function renderProduct(e: NaverCatalogEntry): string {
  return `  <product>
    <id>${esc(e.id)}</id>
    <name>${esc(e.name)}</name>
    <basePrice>${e.basePrice}</basePrice>
    <taxType>${e.taxType}</taxType>
    <infoUrl>${esc(e.infoUrl)}</infoUrl>
    <imageUrl>${esc(e.imageUrl)}</imageUrl>
    <status>ON_SALE</status>
    <shippingPolicy>
      <method>DELIVERY</method>
      <feeType>FREE</feeType>
      <feePayType>FREE</feePayType>
      <feePrice>0</feePrice>
    </shippingPolicy>
  </product>`;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  const products = error ? [] : (data ?? []);
  const entries = products.flatMap((p) => productToCatalogEntries(p, BASE_URL));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<products>
${entries.map(renderProduct).join("\n")}
</products>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=UTF-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
