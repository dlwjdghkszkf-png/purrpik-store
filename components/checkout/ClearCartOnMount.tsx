"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

/**
 * 주문 완료(계좌 안내 / 결제 성공) 페이지에서 마운트 시 장바구니를 비운다.
 *
 * 왜 여기서 비우나:
 *   체크아웃 패널에서 clearCart() 후 router.push 하면, 체크아웃 페이지의
 *   "빈 장바구니 → /cart" 리다이렉트가 먼저 발동해 주문 완료 페이지 대신
 *   /cart로 튕기는 레이스가 생긴다. 완료 페이지로 이동한 뒤 여기서 비우면 안전.
 */
export function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
