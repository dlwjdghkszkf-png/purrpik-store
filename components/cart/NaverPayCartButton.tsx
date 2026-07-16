"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/cart/store";
import {
  NAVERPAY_BUTTON_KEY,
  mountNpayButton,
  useNaverPayVisible,
  readNaverInflow,
} from "@/lib/naverpay-client";

const BUTTON_KEY = NAVERPAY_BUTTON_KEY;
const CONTAINER_ID = "npay-cart-button";

/**
 * 네이버페이 장바구니 [구매하기] 버튼 (주문형 — 복수 상품 한 주문 등록).
 * 가이드: 장바구니 페이지에는 구매하기 버튼만 노출(찜/톡톡/혜택 미노출).
 * onBuyClick → /api/naverpay/cart-order 프록시가 장바구니 전 상품을 한 주문으로 등록.
 */
export function NaverPayCartButton() {
  const items = useCartStore((s) => s.items);
  const hasItems = items.length > 0;
  // 검수 요건: 승인 전 운영환경 미노출(preview 토큰 방문자만).
  const visible = useNaverPayVisible();

  // onBuyClick 클로저가 최신 장바구니를 참조하도록 ref 유지.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!BUTTON_KEY || !visible) return;
    // 장바구니 = 구매하기 버튼만 (찜/톡톡/혜택 미노출).
    return mountNpayButton(() => ({
      buttonKey: BUTTON_KEY,
      containerId: CONTAINER_ID,
      orderRegistrationVersion: "2.1",
      type: "template",
      colorTheme: "green",
      enable: itemsRef.current.length > 0,
      components: {
        talkTalk: false,
        wishlist: false,
        benefitMessage: false,
        benefitCoachMark: false,
      },
      onBuyClick: async () => {
        const res = await fetch("/api/naverpay/cart-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: itemsRef.current.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            })),
            inflow: readNaverInflow(), // 광고 유입 추적(NA_CO/NVADID)
          }),
        });
        if (!res.ok) {
          throw new Error("네이버페이 주문 등록 실패");
        }
        const data = await res.json();
        return { key: data.key, merchantNo: data.merchantNo };
      },
    }));
    // hasItems/visible 변할 때 재렌더(enable 토글). onBuyClick은 ref로 최신 참조.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems, visible]);

  if (!BUTTON_KEY || !visible || !hasItems) return null;

  return <div id={CONTAINER_ID} className="min-h-[52px]" />;
}
