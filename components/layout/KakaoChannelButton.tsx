"use client";

import { useEffect, useState } from "react";

const FALLBACK_URL = "https://pf.kakao.com/_purrpik";
const FADE_IN_DELAY_MS = 3000;

/**
 * KakaoChannelButton — Stage 19: 우하단 floating 카카오톡 채널 버튼.
 *
 * 한국 표준 UX (전 D2C/SaaS에서 거의 필수). 카카오 브랜드 노란색만 예외.
 * 페이지 진입 3초 후 fade-in (사용성 — 즉시 노출 시 거슬림).
 * 이모지 금지 (전역 룰) → inline SVG 말풍선 아이콘.
 */
export function KakaoChannelButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), FADE_IN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const channelUrl =
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ?? FALLBACK_URL;

  const handleClick = () => {
    window.open(channelUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="카카오톡 문의"
        title="카카오톡 문의"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE500] shadow-lg transition-colors duration-150 hover:bg-[#FFD500] active:translate-y-px"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-7 text-[#3C1E1E]"
          fill="currentColor"
        >
          <path d="M12 3C6.477 3 2 6.523 2 10.875c0 2.79 1.84 5.23 4.6 6.62-.2.69-.73 2.52-.83 2.91-.13.49.18.48.38.35.16-.1 2.5-1.7 3.5-2.39.77.12 1.55.18 2.35.18 5.523 0 10-3.523 10-7.67C22 6.523 17.523 3 12 3z" />
        </svg>
        <span className="sr-only">카카오톡 채널 새 창 열기</span>
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 hidden lg:block">
          카카오톡 문의
        </span>
      </button>
    </div>
  );
}
