"use client";

import { useEffect } from "react";

/**
 * P1-1: /shop·PDP 데이터 조회 실패 시 "상품 없음"이 아니라 재시도 UI.
 * 일시적 Supabase 순단과 진짜 빈 카탈로그를 구분한다.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[shop/error]", error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-lg font-semibold text-ink">
        상품 정보를 불러오지 못했어요
      </p>
      <p className="max-w-md text-sm text-mute-1">
        일시적인 오류입니다. 상품이 없는 것이 아니니 잠시 후 다시 시도해주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  );
}
