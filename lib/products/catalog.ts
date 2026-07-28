import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient, queryWithRetry } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

/**
 * 활성 마스터 상품 전체. 카탈로그가 작아 필터는 메모리에서 적용.
 *
 * P1-1: 실패 시 절대 []를 반환하지 않는다 — throw 해서
 *  ① error.tsx가 재시도 UI를 보여주고
 *  ② 장애 결과가 24h 캐시되지 않으며(ISR은 마지막 성공값을 계속 서빙)
 *  ③ "등록된 상품 없음"으로 위장되지 않게 한다.
 */
export const getMasterProducts = unstable_cache(
  async (): Promise<ProductRow[]> => {
    const { data, error } = await queryWithRetry<ProductRow[]>(() =>
      createPublicClient()
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("is_master", true)
        .order("display_order", { ascending: true }),
    );
    if (error) {
      throw new Error(`[catalog] master products fetch failed: ${error.message}`);
    }
    return data ?? [];
  },
  ["public-master-products-v1"],
  { revalidate: 86400, tags: ["products"] },
);

/**
 * 단일 마스터 상품. 성공한 0-row와 조회 실패를 구분한다.
 *  - 성공 + 미존재: null 반환 → 호출부가 notFound()
 *  - 조회 실패: throw → error boundary (404로 위장 금지, P1-2)
 */
export const getMasterProductById = unstable_cache(
  async (id: string): Promise<ProductRow | null> => {
    const { data, error } = await queryWithRetry<ProductRow[]>(() =>
      createPublicClient()
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .eq("is_master", true)
        .limit(1),
    );
    if (error) {
      throw new Error(`[catalog] product ${id} fetch failed: ${error.message}`);
    }
    return data && data.length > 0 ? data[0] : null;
  },
  ["public-master-product-v1"],
  { revalidate: 86400, tags: ["products"] },
);

/**
 * 리뷰 목록. productId 있으면 해당 상품, 없으면 전체.
 * P2-2: 캐시 + 재시도로 순단 방어. 리뷰는 없어도 페이지가 유효하므로
 *  최종 실패 시 throw하지 않고 []를 반환하되(호출부가 error boundary를 원치 않음)
 *  재시도로 일시 순단은 걸러낸다.
 */
export const getReviews = unstable_cache(
  async (productId?: string): Promise<ReviewRow[]> => {
    const { data, error } = await queryWithRetry<ReviewRow[]>(() => {
      let q = createPublicClient()
        .from("reviews")
        .select("*")
        .order("display_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (productId) q = q.eq("product_id", productId);
      return q;
    });
    if (error) {
      console.error(`[catalog] reviews fetch failed: ${error.message}`);
      return [];
    }
    return data ?? [];
  },
  ["public-reviews-v1"],
  { revalidate: 3600, tags: ["reviews"] },
);

/** 활성 FAQ (카테고리 옵션). P2-2: 캐시 + 재시도. */
export const getFaqs = unstable_cache(
  async (category?: string): Promise<FaqRow[]> => {
    const { data, error } = await queryWithRetry<FaqRow[]>(() => {
      let q = createPublicClient()
        .from("faqs")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (category) q = q.eq("category", category as FaqRow["category"]);
      return q;
    });
    if (error) {
      console.error(`[catalog] faqs fetch failed: ${error.message}`);
      return [];
    }
    return data ?? [];
  },
  ["public-faqs-v1"],
  { revalidate: 86400, tags: ["faqs"] },
);
