/**
 * Stage 15 → Stage 18 — cart store (Zustand) 유닛 테스트.
 *
 * 시나리오:
 *   1) addItem 정상 추가
 *   2) 중복 productId+variantId → quantity 누적
 *   3) 같은 productId 다른 variantId → 별도 라인 (Stage 18)
 *   4) removeItem (variantId 인자 포함)
 *   5) updateQty 일반 / qty<=0 → 제거
 *   6) clear
 *   7) selectCartCount / selectCartSubtotal
 *
 * jsdom 없이 node 환경에서 동작하도록 localStorage stub 주입.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// localStorage stub — zustand persist가 storage 접근 시 throw 안 하도록.
const memStore = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => memStore.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memStore.set(k, v);
  },
  removeItem: (k: string) => {
    memStore.delete(k);
  },
  clear: () => memStore.clear(),
});
// persist는 window 체크 후 localStorage를 호출 — window가 있다고 가짜로 만들어 줌.
vi.stubGlobal("window", { localStorage: globalThis.localStorage });

const { useCartStore, selectCartCount, selectCartSubtotal } = await import(
  "@/lib/cart/store"
);

const ITEM_A = {
  productId: "purrpik-shelter",
  variantId: "basic-m",
  name: "푸르픽 길고양이집 · BASIC M",
  price: 29900,
  quantity: 1,
  hero_image: "/img/a.jpg",
};
const ITEM_B = {
  productId: "purrpik-shelter",
  variantId: "basic-l",
  name: "푸르픽 길고양이집 · BASIC L",
  price: 34900,
  quantity: 2,
  hero_image: "/img/b.jpg",
};
const ITEM_LEGACY = {
  productId: "legacy-single",
  // variantId undefined — 기존 단일 product 호환.
  name: "Legacy Single Product",
  price: 10000,
  quantity: 1,
  hero_image: "/img/legacy.jpg",
};

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it("addItem — 빈 카트에 신규 추가", () => {
    useCartStore.getState().addItem(ITEM_A);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("purrpik-shelter");
    expect(items[0].variantId).toBe("basic-m");
    expect(items[0].quantity).toBe(1);
  });

  it("addItem — 같은 productId+variantId는 quantity 누적", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 3 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  it("addItem — 같은 productId 다른 variantId는 별도 라인 (Stage 18)", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.variantId)).toEqual(["basic-m", "basic-l"]);
  });

  it("addItem — 다른 productId는 새 라인", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_LEGACY);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("removeItem — 지정 productId+variantId 제거", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    useCartStore.getState().removeItem("purrpik-shelter", "basic-m");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe("basic-l");
  });

  it("removeItem — legacy (variantId 없음)도 제거 가능", () => {
    useCartStore.getState().addItem(ITEM_LEGACY);
    useCartStore.getState().removeItem("legacy-single");
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("updateQty — 일반 수량 변경", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().updateQty("purrpik-shelter", 5, "basic-m");
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("updateQty — qty<=0이면 제거", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    useCartStore.getState().updateQty("purrpik-shelter", 0, "basic-m");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe("basic-l");
  });

  it("clear — 전체 비움", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("selectCartCount — 총 수량 합", () => {
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 2 });
    useCartStore.getState().addItem(ITEM_B);
    expect(selectCartCount(useCartStore.getState())).toBe(4);
  });

  it("selectCartSubtotal — 가격×수량 합", () => {
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 2 });
    useCartStore.getState().addItem(ITEM_B);
    // 29900 * 2 + 34900 * 2 = 129600
    expect(selectCartSubtotal(useCartStore.getState())).toBe(129_600);
  });
});
