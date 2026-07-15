/**
 * 네이버페이 주문형 — 상품 카탈로그 파생 (id/이름/가격/URL) 단일화.
 * 시크릿 없음(서버/클라 공용 안전) — parseVariants/editionLabel만 의존.
 *
 * ⚠️ parity 중요: 상품정보 XML 피드(/naverpay/products.xml)와
 * 주문등록 API(order/cart-order route)가 **동일 로직**으로 id/가격을 파생해야
 * 네이버페이 결제 검증(피드 상품ID·가격 == 등록 상품ID·가격)이 통과함.
 * 불일치 시 "구매불가" 팝업으로 결제 중단됨.
 */
import type { Database, ProductVariants } from "@/lib/supabase/types";
import { parseVariants, editionLabel } from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Sku = ProductVariants["skus"][number];

export interface NaverCatalogEntry {
  id: string; // 네이버페이 상품ID (SKU 있으면 sku.id, 없으면 product.id)
  name: string;
  basePrice: number;
  taxType: "TAX" | "TAX_FREE";
  infoUrl: string; // 상품 상세 페이지 URL
  imageUrl: string;
}

function imageUrlFor(product: ProductRow, baseUrl: string): string {
  return product.hero_image
    ? `${baseUrl}${product.hero_image}`
    : `${baseUrl}/images/products/placeholder.jpg`;
}

function skuLabelOf(sku: Sku): string {
  return sku.edition ? `${editionLabel(sku.edition)} ${sku.size}` : sku.size;
}

/**
 * product + (선택) sku → 단일 카탈로그 엔트리.
 * register(주문등록)와 feed(상품정보 XML)가 공유하는 파생 로직.
 */
export function catalogEntry(
  product: ProductRow,
  sku: Sku | null,
  baseUrl: string,
): NaverCatalogEntry {
  const label = sku ? skuLabelOf(sku) : null;
  return {
    id: sku?.id ?? product.id,
    name: label ? `${product.name} (${label})` : product.name,
    basePrice: sku?.price ?? product.price,
    taxType: "TAX", // 펫 용품 = 과세
    infoUrl: `${baseUrl}/shop/${product.id}`,
    imageUrl: imageUrlFor(product, baseUrl),
  };
}

/**
 * 상품의 구매가능한 모든 엔트리(SKU별, 옵션 없으면 상품 1개) — 상품정보 XML 피드용.
 */
export function productToCatalogEntries(
  product: ProductRow,
  baseUrl: string,
): NaverCatalogEntry[] {
  const variants = parseVariants(product.variants);
  const skus = variants?.skus ?? [];
  if (skus.length > 0) {
    return skus.map((s) => catalogEntry(product, s, baseUrl));
  }
  return [catalogEntry(product, null, baseUrl)];
}

/** XML 특수문자 이스케이프 (피드/등록 공용). */
export function naverpayXmlEscape(v: string | number): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
