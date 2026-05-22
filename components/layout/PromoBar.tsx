"use client";

import { useEffect, useState } from "react";

/**
 * PromoBar — Stage 19: 5 메시지 좌우 슬라이드 (4초 간격).
 *
 * 한국 D2C 카루셀 톤 (마켓컬리·29CM·무신사 영향).
 * 이모지 금지 (전역 룰).
 */
const MESSAGES = [
  "장마 D-30 · 장마 전 도착 보장",
  "전제품 무료배송",
  "30일 만족보증 · 무료반품",
  "리뷰 작성 시 1,000P 적립",
  "회원가입 5,000원 쿠폰",
];

const INTERVAL_MS = 4000;

export function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="region"
      aria-label="공지"
      className="bg-ink text-white text-[12px] leading-[1.4]"
    >
      <div className="container-page h-9 flex items-center justify-center overflow-hidden">
        <div
          aria-live="polite"
          className="relative w-full text-center"
        >
          <span className="block truncate animate-promo-slide" key={index}>
            {MESSAGES[index]}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes promoSlide {
          0% {
            opacity: 0;
            transform: translateX(24px);
          }
          12% {
            opacity: 1;
            transform: translateX(0);
          }
          88% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-24px);
          }
        }
        :global(.animate-promo-slide) {
          animation: promoSlide 4000ms ease-in-out;
        }
      `}</style>
    </div>
  );
}
