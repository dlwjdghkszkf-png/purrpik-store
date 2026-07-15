"use client";

import { useEffect, useRef } from "react";
import type { Database, ProductVariants } from "@/lib/supabase/types";
import {
  NAVERPAY_BUTTON_KEY,
  mountNpayButton,
  useNaverPayVisible,
} from "@/lib/naverpay-client";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Sku = ProductVariants["skus"][number];

const BUTTON_KEY = NAVERPAY_BUTTON_KEY;

/**
 * 네이버페이 [구매하기] 버튼 (네이버페이 주문형 — 구매정보 연동).
 * 가이드 2.1: onBuyClick에서 주문정보 등록 API 호출 결과({key, merchantNo})를 반환해야 함.
 * 찜하기/톡톡은 별도 연동(찜정보 등록, 톡톡 채널) 전이라 비활성.
 */
export function NaverPayButton({
  product,
  selectedSku,
  quantity,
}: {
  product: ProductRow;
  selectedSku: Sku | null;
  quantity: number;
}) {
  const containerId = `npay-button-${product.id}`;
  // 검수 요건: 승인 전 운영환경 미노출(preview 토큰 방문자만).
  const visible = useNaverPayVisible();
  // onBuyClick 클로저가 최신 selectedSku/quantity를 참조하도록 ref로 유지.
  const stateRef = useRef({ productId: product.id, selectedSku, quantity });
  stateRef.current = { productId: product.id, selectedSku, quantity };

  useEffect(() => {
    if (!BUTTON_KEY || !visible) return;
    // 상품상세: 구매/찜/톡톡 슬롯(찜·톡톡 미연동은 SDK가 비활성 표시).
    return mountNpayButton(() => ({
      buttonKey: BUTTON_KEY,
      containerId,
      orderRegistrationVersion: "2.1",
      type: "template",
      colorTheme: "green",
      enable: !!stateRef.current.selectedSku,
      components: {
        talkTalk: false, // 네이버 톡톡 미연동
        wishlist: false, // 찜 정보 연동 별도 구현 전
        benefitMessage: true,
        benefitCoachMark: true,
      },
      onBuyClick: async () => {
        const { productId, selectedSku: sku, quantity: qty } = stateRef.current;
        const res = await fetch("/api/naverpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            variantId: sku?.id,
            quantity: qty,
          }),
        });
        if (!res.ok) {
          throw new Error("네이버페이 주문 등록 실패");
        }
        const data = await res.json();
        return { key: data.key, merchantNo: data.merchantNo };
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, containerId, selectedSku?.id, quantity]);

  if (!BUTTON_KEY || !visible) return null;

  return <div id={containerId} className="mt-3 min-h-[52px]" />;
}
