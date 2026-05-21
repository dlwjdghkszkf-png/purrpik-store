"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "장마 D-30 · 장마 전 도착 보장",
  "전제품 무료배송",
  "30일 만족보증",
];

export function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 5000);
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
          <span className="block truncate animate-promo-fade" key={index}>
            {MESSAGES[index]}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes promoFade {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          15% {
            opacity: 1;
            transform: translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-6px);
          }
        }
        :global(.animate-promo-fade) {
          animation: promoFade 5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
