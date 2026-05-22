"use client";

/**
 * FreeShippingProgress — Stage 19: 카트·드로어 상단 무료배송 진행바.
 *
 * 푸르픽은 전제품 무료배송 정책이라 임계 차감 의미 모호 → 진행바 100% 채움 +
 * 브랜드 약속 메시지 표시 (대안 A).
 * 이모지 금지 (전역 룰).
 */
interface Props {
  subtotal: number;
  /** 옵션 — 향후 임계 정책 도입 시 사용. 미설정 시 항상 100% 진행. */
  threshold?: number;
}

export function FreeShippingProgress({ subtotal, threshold }: Props) {
  // threshold 없으면 무조건 100% (현재 정책).
  const remaining =
    threshold != null ? Math.max(0, threshold - subtotal) : 0;
  const filled = threshold != null
    ? Math.min(100, Math.round((subtotal / threshold) * 100))
    : 100;
  const isFree = remaining === 0;

  const message = isFree
    ? "전 상품 무료배송 · 30일 만족보증"
    : `${new Intl.NumberFormat("ko-KR").format(remaining)}원 더 담으면 무료배송`;

  return (
    <div
      className="rounded-md border border-line bg-secondary/40 px-3 py-2.5"
      role="status"
      aria-live="polite"
    >
      <p className="flex items-center justify-between text-[12px] font-medium text-ink">
        <span>{message}</span>
        {isFree && (
          <span className="text-[11px] font-normal text-mute-1">(적용 중)</span>
        )}
      </p>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-mustard transition-[width] duration-300"
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}
