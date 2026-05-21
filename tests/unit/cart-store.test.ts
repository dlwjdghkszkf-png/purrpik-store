/**
 * Stage 15 — cart store (Zustand) 유닛 테스트.
 *
 * 시나리오:
 *   1) addItem 정상 추가
 *   2) 중복 productId → quantity 누적
 *   3) removeItem
 *   4) updateQty 일반 / qty<=0 → 제거
 *   5) clear
 *   6) selectCartCount / selectCartSubtotal
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
  productId: "basic-m",
  name: "BASIC M",
  price: 39000,
  quantity: 1,
  hero_image: "/img/a.jpg",
};
const ITEM_B = {
  productId: "basic-l",
  name: "BASIC L",
  price: 49000,
  quantity: 2,
  hero_image: "/img/b.jpg",
};

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it("addItem — 빈 카트에 신규 추가", () => {
    useCartStore.getState().addItem(ITEM_A);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("basic-m");
    expect(items[0].quantity).toBe(1);
  });

  it("addItem — 중복 productId는 quantity 누적", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem({ ...ITEM_A, quantity: 3 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  it("addItem — 다른 productId는 새 라인", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("removeItem — 지정 productId 제거", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    useCartStore.getState().removeItem("basic-m");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("basic-l");
  });

  it("updateQty — 일반 수량 변경", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().updateQty("basic-m", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("updateQty — qty<=0이면 제거", () => {
    useCartStore.getState().addItem(ITEM_A);
    useCartStore.getState().addItem(ITEM_B);
    useCartStore.getState().updateQty("basic-m", 0);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe("basic-l");
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
    // 39000 * 2 + 49000 * 2 = 176000
    expect(selectCartSubtotal(useCartStore.getState())).toBe(176_000);
  });
});
