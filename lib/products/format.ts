import type { Database, ProductVariants } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * 상품 가격을 ko-KR 통화 표기로 반환.
 * 예: 29900 → "₩29,900"
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
}

/**
 * Stage 18 — 마스터 상품 가격 range 표기.
 * 같은 값이면 단가, 다르면 "min부터".
 * 예: (29900, 44900) → "₩29,900부터"
 */
export function formatPriceRange(min: number, max: number): string {
  return min === max ? formatPrice(min) : `${formatPrice(min)}부터`;
}

/**
 * 구성품 배열을 "+" 구분 문자열로 요약.
 * 예: ["본체", "담요"] → "본체 + 담요"
 */
export function summarizeIncludes(includes: ProductRow["includes"]): string {
  if (!Array.isArray(includes)) return "본체";
  return (includes as string[]).join(" + ");
}

/**
 * 에디션 enum → 표시 라벨 (BASIC / ALL-IN-ONE).
 */
export function editionLabel(edition: string): string {
  return edition === "ALL_IN_ONE" ? "ALL-IN-ONE" : "BASIC";
}

/**
 * Stage 18 — 마스터 variants에서 선택 조합에 맞는 SKU 검색.
 * selection: { edition: 'BASIC', size: 'M' } 같은 라디오 선택값.
 * 못 찾으면 undefined (UI에서 fallback 처리).
 */
export function findSku(
  variants: ProductVariants,
  selection: Record<string, string>,
): ProductVariants["skus"][number] | undefined {
  return variants.skus.find((sku) =>
    Object.entries(selection).every(([axisId, optionId]) => {
      const value = (sku as unknown as Record<string, string>)[axisId];
      return value === optionId;
    }),
  );
}

/**
 * Stage 18 — variants가 JSONB(Json type)으로 들어와도 안전하게 narrowing.
 * axes·skus가 둘 다 배열인 경우만 valid.
 */
export function parseVariants(value: unknown): ProductVariants | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.axes) || !Array.isArray(obj.skus)) return null;
  return obj as unknown as ProductVariants;
}
