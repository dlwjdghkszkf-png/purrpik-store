import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * 상품 가격을 ko-KR 통화 표기로 반환.
 * 예: 29900 → "₩29,900"
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
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
export function editionLabel(edition: ProductRow["edition"]): string {
  return edition === "ALL_IN_ONE" ? "ALL-IN-ONE" : "BASIC";
}
