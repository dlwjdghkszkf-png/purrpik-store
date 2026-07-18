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
 *
 * 요청 필터(검수관 지적): 네이버는 상품 정보 요청 시 아래처럼 대상 상품ID를 쿼리로 전달.
 *   ?product[0][id]=coolmat-s&product[0][optionManageCodes]=...&optionSearch=true
 * 이 경우 요청된 product[N][id]에 해당하는 상품만 반환(전체 노출 금지). 파라미터
 * 없으면(초기 크롤 등) 전체 반환. 우리 SKU 모델은 각 조합이 독립 id라 옵션코드/사은품
 * 파라미터는 무시하고 id 필터만 적용.
 */
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  productToCatalogEntries,
  naverpayXmlEscape as esc,
  type NaverCatalogEntry,
} from "@/lib/naverpay-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 재고/가격 실시간 반영

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.purrpik.co.kr";

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

export async function GET(req: NextRequest) {
  // 네이버 요청 파라미터에서 대상 상품ID 수집: product[0][id], product[1][id], ...
  // selector 존재 여부(hasSelector)를 값 유무와 분리 → 빈 값(?product[0][id]=)이
  // 오면 "필터 요청됨 + 매칭 0"으로 처리(전체 반환 금지).
  let hasSelector = false;
  const requestedIds = new Set<string>();
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    if (/^product\[\d+\]\[id\]$/.test(key)) {
      hasSelector = true;
      if (value) requestedIds.add(value);
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  // DB 오류를 빈 피드(200)로 위장하지 않음 — 전상품 품절처럼 보이는 캐시 방지.
  if (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<error>service unavailable</error>\n`,
      {
        status: 503,
        headers: {
          "content-type": "application/xml; charset=UTF-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  let entries = (data ?? []).flatMap((p) =>
    productToCatalogEntries(p, BASE_URL),
  );

  // 요청 selector가 있으면 해당 상품만 반환(빈 selector면 결과 없음).
  if (hasSelector) {
    entries = entries.filter((e) => requestedIds.has(e.id));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<products>
${entries.map(renderProduct).join("\n")}
</products>
`;

  // 등록가와 실시간 parity 보장 위해 캐시 금지(가격 stale = 구매불가 팝업 방지).
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=UTF-8",
      "cache-control": "no-store",
    },
  });
}
