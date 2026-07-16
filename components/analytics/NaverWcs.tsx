"use client";

/**
 * 네이버 공통 유입 스크립트 (wcslog.js) — 네이버페이 주문형 검수 필수 요건.
 * 검수관 요청: 가맹점 웹사이트 전역(PC/모바일)에 삽입.
 *
 * - 결제 퍼널 귀속(checkoutWhitelist) + 유입 분석(inflow)에 쓰이며 네이버페이 결제
 *   기능에 필요 → 쿠키 동의 게이팅 없이 전역 로드(검수관 fresh 브라우저에서도 동작).
 * - wa 값(s_1f15c4d9f0d6)은 네이버가 발급한 공개 추적 ID(비밀 아님).
 * - onLoad에서 초기화(wcslog.js 로드 완료 후 wcs 객체 보장) + SPA 라우트 변경 시
 *   usePathname 훅으로 pageview(wcs_do) 재전송.
 */
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const WA = "s_1f15c4d9f0d6";
const CHECKOUT_WHITELIST = ["purrpik.co.kr", "www.purrpik.co.kr"];
const INFLOW_DOMAIN = "nfnl.kr";

type WcsWindow = Window & {
  wcs_add?: Record<string, string>;
  wcs_do?: () => void;
  wcs?: {
    checkoutWhitelist?: string[];
    inflow?: (domain: string) => void;
  };
};

/** wcs 초기화 + pageview 전송 (wcslog.js 로드 이후에만 동작). */
function fireWcs(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as WcsWindow;
  if (!w.wcs || typeof w.wcs_do !== "function") return false;
  if (!w.wcs_add) w.wcs_add = {};
  w.wcs_add["wa"] = WA;
  w.wcs.checkoutWhitelist = CHECKOUT_WHITELIST;
  w.wcs.inflow?.(INFLOW_DOMAIN);
  w.wcs_do();
  return true;
}

export function NaverWcs() {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  // SPA 라우트 변경 시 pageview 재전송(최초 로드는 Script onLoad에서 처리).
  useEffect(() => {
    if (loadedRef.current) fireWcs();
  }, [pathname]);

  return (
    <Script
      src="https://wcs.naver.net/wcslog.js"
      strategy="afterInteractive"
      onLoad={() => {
        loadedRef.current = true;
        fireWcs();
      }}
    />
  );
}
