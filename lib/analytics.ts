"use client";

/**
 * Stage 12 + Stage 14 — Analytics 중앙 helper.
 *
 * 쿠키 동의 상태 hook + GA4/Meta Pixel 호출 wrapper.
 * Stage 14: ecommerce 표준 이벤트 (view_item / add_to_cart / begin_checkout / purchase).
 *
 * 동의 상태 source-of-truth는 components/layout/CookieBanner.tsx (localStorage + window event).
 * 여기서는 re-export로 단일 진입점 제공.
 *
 * GA4 ecommerce items 스키마 + Meta Pixel `content_ids`/`contents` 둘 다 채워서 한 콜로 처리.
 * gtag/fbq 미로드 (env 미설정 or 동의 안 됨) 시 모두 silently no-op.
 */

export {
  useCookieConsent,
  getCookieConsent,
  type CookieConsent,
} from "@/components/layout/CookieBanner";

/** GA4 이벤트 — 동의 안 됐거나 gtag 미로드면 silently no-op */
export function gaEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

/** Meta Pixel 이벤트 — fbq 미로드면 silently no-op */
export function pixelEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", name, params ?? {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 14 — Ecommerce 표준 이벤트
// ─────────────────────────────────────────────────────────────────────────────

/** GA4 ecommerce items 스키마 + Pixel content 매핑용 공통 형태. */
export interface EcommerceItem {
  /** 'basic-m' 등 product SKU */
  item_id: string;
  /** '푸르픽 길고양이집 BASIC M' */
  item_name: string;
  /** 단가 (원, KRW) */
  price: number;
  /** 수량 */
  quantity: number;
}

/** PDP view 시 호출. GA4 view_item + Pixel ViewContent. */
export function trackViewItem(item: EcommerceItem): void {
  gaEvent("view_item", {
    currency: "KRW",
    value: item.price,
    items: [item],
  });
  pixelEvent("ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    currency: "KRW",
    value: item.price,
  });
}

/** 카트 담기 시 호출. GA4 add_to_cart + Pixel AddToCart. */
export function trackAddToCart(item: EcommerceItem): void {
  const lineTotal = item.price * item.quantity;
  gaEvent("add_to_cart", {
    currency: "KRW",
    value: lineTotal,
    items: [item],
  });
  pixelEvent("AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    currency: "KRW",
    value: lineTotal,
  });
}

/** /checkout 진입 시 호출. GA4 begin_checkout + Pixel InitiateCheckout. */
export function trackBeginCheckout(
  items: EcommerceItem[],
  total: number,
): void {
  gaEvent("begin_checkout", {
    currency: "KRW",
    value: total,
    items,
  });
  pixelEvent("InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity })),
    currency: "KRW",
    value: total,
    num_items: items.reduce((s, i) => s + i.quantity, 0),
  });
}

/** 결제 성공 시 호출. GA4 purchase + Pixel Purchase. */
export function trackPurchase(
  orderId: string,
  items: EcommerceItem[],
  total: number,
): void {
  gaEvent("purchase", {
    transaction_id: orderId,
    currency: "KRW",
    value: total,
    items,
  });
  pixelEvent("Purchase", {
    content_ids: items.map((i) => i.item_id),
    contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity })),
    currency: "KRW",
    value: total,
    num_items: items.reduce((s, i) => s + i.quantity, 0),
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
