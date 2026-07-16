"use client";

import { useEffect, useState } from "react";

/**
 * 네이버페이 구매버튼 SDK 클라이언트 공용 (상품상세 + 장바구니 버튼 공유).
 * SDK URL/토글/전역 타입을 한 곳에서 관리 — 드리프트 방지.
 *
 * 검수 완료 전까지 SANDBOX SDK 고정.
 * 최종 승인 후: NEXT_PUBLIC_NAVERPAY_SANDBOX=false 로 env 설정.
 */
export const NAVERPAY_BUTTON_KEY =
  process.env.NEXT_PUBLIC_NAVERPAY_BUTTON_KEY ?? "";

const SANDBOX = process.env.NEXT_PUBLIC_NAVERPAY_SANDBOX !== "false";

/**
 * 검수 모드 = SANDBOX 여부. 네이버 최종 승인 전까지 true.
 * 검수 요건: "서비스 오픈 전까지 운영환경에서 버튼 미노출" → review mode일 땐
 * preview 토큰을 가진 방문(검수관)에게만 노출. 승인 후 SANDBOX=false → 전체 노출.
 */
export const NAVERPAY_REVIEW_MODE = SANDBOX;
const PREVIEW_TOKEN = process.env.NEXT_PUBLIC_NAVERPAY_PREVIEW_TOKEN ?? "";
const PREVIEW_STORAGE_KEY = "npay_preview";

/**
 * 네이버페이 버튼 노출 여부.
 * - 승인 후(review mode off): 전체 사용자 노출.
 * - 검수 중(review mode on): `?npay=<PREVIEW_TOKEN>`로 최초 진입 시 localStorage
 *   플래그를 남기고, 그 브라우저에서만 노출. 일반 사용자는 토큰이 없어 미노출.
 *   토큰 미설정 시엔 아무에게도 노출 안 됨(운영 노출 차단 안전 기본값).
 */
export function useNaverPayVisible(): boolean {
  // 초기값: 승인 후엔 true, 검수 중엔 false → SSR/CSR 동일(하이드레이션 안전).
  const [visible, setVisible] = useState(!NAVERPAY_REVIEW_MODE);

  useEffect(() => {
    if (!NAVERPAY_REVIEW_MODE) {
      setVisible(true);
      return;
    }
    try {
      const token = new URLSearchParams(window.location.search).get("npay");
      if (PREVIEW_TOKEN && token === PREVIEW_TOKEN) {
        window.localStorage.setItem(PREVIEW_STORAGE_KEY, "1");
        setVisible(true);
        return;
      }
      if (window.localStorage.getItem(PREVIEW_STORAGE_KEY) === "1") {
        setVisible(true);
        return;
      }
    } catch {
      // localStorage 차단 환경 → 미노출(안전측)
    }
    setVisible(false);
  }, []);

  return visible;
}
const SDK_ID = "naverpay-button-sdk";
const SDK_SRC = SANDBOX
  ? "https://test-pay.naver.com/assets/button/latest/npay.button.js"
  : "https://npay-order.pstatic.net/assets/button/latest/npay.button.js";

/** 광고 유입 쿠키(wcslog.js가 심음) → 주문등록 필드 매핑 값. */
export interface NaverInflowPayload {
  naverInflowCode?: string;
  saClickId?: string;
  cpaInflowCode?: string;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + escaped + "=([^;]*)"),
  );
  return m ? decodeURIComponent(m[1]) : "";
}

/**
 * NaPm 유입 시 wcslog.js가 심는 쿠키를 읽어 주문등록용 필드로 변환.
 * NA_CO→naverInflowCode, NVADID→saClickId, CPAValidator→cpaInflowCode.
 * 값 없으면 해당 키 생략(일반 주문).
 */
export function readNaverInflow(): NaverInflowPayload {
  const naverInflowCode = readCookie("NA_CO");
  const saClickId = readCookie("NVADID");
  const cpaInflowCode = readCookie("CPAValidator");
  const out: NaverInflowPayload = {};
  if (naverInflowCode) out.naverInflowCode = naverInflowCode;
  if (saClickId) out.saClickId = saClickId;
  if (cpaInflowCode) out.cpaInflowCode = cpaInflowCode;
  return out;
}

export interface NpayButtonInstance {
  dispose?: () => void;
}

export interface NpayOrderCreateOptions {
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
    Npay?: {
      order: {
        create: (
          opts: NpayOrderCreateOptions,
        ) => Promise<NpayButtonInstance> | void;
      };
    };
  }
}

/** SDK <script> 1회 삽입 (중복 삽입 방지). */
export function ensureNpaySdk(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(SDK_ID)) return;
  const s = document.createElement("script");
  s.id = SDK_ID;
  s.src = SDK_SRC;
  s.async = true;
  document.head.appendChild(s);
}

// SDK 준비 폴링 상한 (100ms × 60 = 6초). CSP 차단/로드 실패 시 무한 폴링 방지.
const SDK_POLL_INTERVAL_MS = 100;
const SDK_POLL_MAX_ATTEMPTS = 60;

/**
 * 버튼을 마운트하고 정리 함수를 반환 (useEffect cleanup에서 호출).
 * - SDK 준비될 때까지 상한 폴링(무한 루프 방지) 후 create.
 * - 생성된 인스턴스를 보관해 cleanup에서 dispose() — SPA 언마운트/재렌더 누수 방지.
 * - 비동기 생성 레이스: cleanup이 먼저 돌면 생성 완료된 인스턴스를 즉시 dispose.
 * buildOptions는 매 render 시 호출되어 최신 상태(enable 등)를 반영.
 */
export function mountNpayButton(
  buildOptions: () => NpayOrderCreateOptions,
): () => void {
  let cancelled = false;
  let instance: NpayButtonInstance | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;

  function render() {
    if (cancelled || !window.Npay) return;
    const opts = buildOptions();
    const el = document.getElementById(opts.containerId);
    if (el) el.innerHTML = ""; // 재렌더 시 중복 삽입 방지
    const created = window.Npay.order.create(opts);
    Promise.resolve(created)
      .then((inst) => {
        if (!inst) return;
        if (cancelled) inst.dispose?.();
        else instance = inst;
      })
      .catch(() => {});
  }

  ensureNpaySdk();

  if (window.Npay) {
    render();
  } else {
    let attempts = 0;
    timer = setInterval(() => {
      if (cancelled) return;
      attempts += 1;
      if (window.Npay) {
        if (timer) clearInterval(timer);
        timer = null;
        render();
      } else if (attempts >= SDK_POLL_MAX_ATTEMPTS) {
        if (timer) clearInterval(timer);
        timer = null; // SDK 미로드 — 조용히 포기
      }
    }, SDK_POLL_INTERVAL_MS);
  }

  return () => {
    cancelled = true;
    if (timer) clearInterval(timer);
    try {
      instance?.dispose?.();
    } catch {
      // dispose 실패 무시
    }
  };
}
