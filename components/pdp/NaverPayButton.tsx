"use client";

import { useEffect, useRef } from "react";
import type { Database, ProductVariants } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Sku = ProductVariants["skus"][number];

const BUTTON_KEY = process.env.NEXT_PUBLIC_NAVERPAY_BUTTON_KEY ?? "";
const SDK_ID = "naverpay-button-sdk";
// 네이버페이 검수 완료 전까지 SANDBOX SDK 고정.
// 최종승인 후: NEXT_PUBLIC_NAVERPAY_SANDBOX=false 로 env 설정.
const SANDBOX = process.env.NEXT_PUBLIC_NAVERPAY_SANDBOX !== "false";
const SDK_SRC = SANDBOX
  ? "https://test-pay.naver.com/assets/button/latest/npay.button.js"
  : "https://npay-order.pstatic.net/assets/button/latest/npay.button.js";

interface NpayOrderCreateOptions {
  buttonKey: string;
  containerId: string;
  orderRegistrationVersion: "2.1";
  type: "template";
  colorTheme: "green" | "white";
  enable: boolean;
  components: {
    talkTalk: boolean;
    wishlist: boolean;
    benefitMessage: boolean;
    benefitCoachMark: boolean;
  };
  onBuyClick: () => Promise<{ key: string; merchantNo?: string }>;
}

declare global {
  interface Window {
    Npay?: { order: { create: (opts: NpayOrderCreateOptions) => void } };
  }
}

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
  // onBuyClick 클로저가 최신 selectedSku/quantity를 참조하도록 ref로 유지.
  const stateRef = useRef({ productId: product.id, selectedSku, quantity });
  stateRef.current = { productId: product.id, selectedSku, quantity };

  useEffect(() => {
    if (!BUTTON_KEY) return;

    function init() {
      window.Npay?.order.create({
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
          const { productId, selectedSku: sku, quantity: qty } =
            stateRef.current;
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
      });
    }

    if (window.Npay) {
      init();
      return;
    }
    let script = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SDK_ID;
      script.src = SDK_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script?.removeEventListener("load", init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, selectedSku?.id]);

  if (!BUTTON_KEY) return null;

  return <div id={containerId} className="mt-3 min-h-[52px]" />;
}
