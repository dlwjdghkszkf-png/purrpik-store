"use client";

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
const SDK_ID = "naverpay-button-sdk";
const SDK_SRC = SANDBOX
  ? "https://test-pay.naver.com/assets/button/latest/npay.button.js"
  : "https://npay-order.pstatic.net/assets/button/latest/npay.button.js";

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
