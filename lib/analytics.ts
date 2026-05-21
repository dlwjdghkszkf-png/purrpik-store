"use client";

/**
 * Stage 12 — Analytics 중앙 helper.
 *
 * 쿠키 동의 상태 hook + GA4/Meta Pixel 호출 wrapper.
 * Stage 14에서 ecommerce 이벤트(view_item / add_to_cart / purchase) 추가 예정.
 *
 * 동의 상태 source-of-truth는 components/layout/CookieBanner.tsx (localStorage + window event).
 * 여기서는 re-export로 단일 진입점 제공.
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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
