"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: string;
  /** Stage 18 — master product의 SKU id (예: 'basic-m'). 옵션 — 기존 호환. */
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  hero_image: string;
};

/** productId + variantId 조합으로 라인 식별 (variant 없으면 productId만). */
function sameLine(a: CartItem, b: CartItem) {
  return a.productId === b.productId && (a.variantId ?? "") === (b.variantId ?? "");
}

/** Stage 18 — 라인 식별 키 (productId + variantId 호환). */
function lineKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && (i.variantId ?? "") === (variantId ?? "")),
          ),
        })),
      updateQty: (productId, qty, variantId) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter(
                  (i) =>
                    !(i.productId === productId &&
                      (i.variantId ?? "") === (variantId ?? "")),
                )
              : state.items.map((i) =>
                  i.productId === productId &&
                  (i.variantId ?? "") === (variantId ?? "")
                    ? { ...i, quantity: qty }
                    : i,
                ),
        })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "purrpik-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as never),
      ),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** 카운트 selector — total quantity */
export const selectCartCount = (state: { items: CartItem[] }) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/** 합계 selector — sum of price * qty */
export const selectCartSubtotal = (state: { items: CartItem[] }) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** Stage 18 — UI 키 헬퍼 export. */
export { lineKey };
