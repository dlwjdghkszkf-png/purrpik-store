/**
 * P0-1/P0-2 회귀 방지 — lib/checkout/pricing.priceCheckout.
 *
 * 핵심 불변식: 주문 금액은 DB 카탈로그에서만 계산된다. 클라이언트는
 * {productId, variantId, quantity}만 보내고 가격을 조작할 수 없다.
 *
 * 시나리오:
 *   1) 정상 복수 라인 — 합계는 DB 단가 × 수량의 총합
 *   2) 유효하지 않은 SKU → 거부
 *   3) 비활성/미존재 상품 → 거부
 *   4) 수량 경계(0, 초과, 비정수) → 거부
 *   5) variant 없는 단일가 상품 → product.price 사용
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

const SHELTER = {
  id: "purrpik-shelter",
  name: "푸르픽 길고양이집",
  price: 29900,
  variants: {
    axes: [],
    skus: [
      { id: "basic-m", edition: "BASIC", size: "M", price: 29900 },
      { id: "basic-l", edition: "BASIC", size: "L", price: 34900 },
    ],
  },
};
const SIMPLE = {
  id: "purrpik-simple",
  name: "단일가 상품",
  price: 9900,
  variants: null,
};

// active=true 인 상품만 반환하도록 흉내내는 Supabase 체이닝 mock.
let activeProducts: Array<Record<string, unknown>>;
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        in: (_col: string, ids: string[]) => ({
          eq: () =>
            Promise.resolve({
              data: activeProducts.filter((p) => ids.includes(p.id as string)),
              error: null,
            }),
        }),
      }),
    }),
  }),
}));

import { priceCheckout } from "@/lib/checkout/pricing";

beforeEach(() => {
  activeProducts = [SHELTER, SIMPLE];
});

describe("priceCheckout", () => {
  it("복수 라인 합계를 DB 단가로 계산한다 (클라 가격 무관)", async () => {
    const r = await priceCheckout([
      { productId: "purrpik-shelter", variantId: "basic-m", quantity: 1 },
      { productId: "purrpik-shelter", variantId: "basic-l", quantity: 2 },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.total).toBe(29900 + 34900 * 2);
    expect(r.lines).toHaveLength(2);
    expect(r.lines[1].lineTotal).toBe(69800);
    expect(r.orderName).toContain("외 1건");
  });

  it("유효하지 않은 SKU는 거부한다", async () => {
    const r = await priceCheckout([
      { productId: "purrpik-shelter", variantId: "does-not-exist", quantity: 1 },
    ]);
    expect(r.ok).toBe(false);
  });

  it("비활성/미존재 상품은 거부한다", async () => {
    activeProducts = []; // 아무 상품도 active 아님
    const r = await priceCheckout([
      { productId: "purrpik-shelter", variantId: "basic-m", quantity: 1 },
    ]);
    expect(r.ok).toBe(false);
  });

  it("수량 경계(0·비정수·초과)를 거부한다", async () => {
    for (const q of [0, -1, 1.5, 100]) {
      const r = await priceCheckout([
        { productId: "purrpik-shelter", variantId: "basic-m", quantity: q },
      ]);
      expect(r.ok).toBe(false);
    }
  });

  it("variant 없는 단일가 상품은 product.price를 쓴다", async () => {
    const r = await priceCheckout([
      { productId: "purrpik-simple", quantity: 3 },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.total).toBe(9900 * 3);
    expect(r.lines[0].variantLabel).toBeNull();
  });

  it("빈 입력을 거부한다", async () => {
    const r = await priceCheckout([]);
    expect(r.ok).toBe(false);
  });
});
