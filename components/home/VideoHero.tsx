"use client";

import Link from "next/link";

/**
 * VideoHero — 풀스크린 비주얼 (영상 도착 전 포스터 + Ken Burns 폴백).
 *
 * 카피 출처: marketing-agent/.../23_detail_page_skeleton.md (S0 H0)
 * - 헤드라인: "바람은 밖에, 온기는 안에."
 * - 서브:    "4중 구조 길고양이 야외 보호 셸터"
 *
 * 이미지: /public/images/hero-poster.jpg (없으면 CSS 그라데이션 폴백)
 */
export function VideoHero() {
  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-ink">
      {/* 배경 영상 (현재는 source 비어있음 → poster만 노출) */}
      <video
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover ken-burns"
      >
        {/* TODO: 실제 영상 자료 도착 시 <source src="/videos/hero.webm" type="video/webm" /> 추가 */}
      </video>

      {/* poster 폴백: 영상·이미지 모두 없을 때 보이는 톤 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900/40"
      />

      {/* 가독성 오버레이 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
      />

      {/* 컨텐츠 */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container-page">
          <p className="text-[12px] font-medium uppercase tracking-[0.25em] text-brand-mustard">
            PURRPIK SHELTER 1.0
          </p>
          <h1 className="mt-4 max-w-3xl text-white text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.05]">
            바람은 밖에,
            <br />
            온기는 안에.
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.375rem)] text-white/80 leading-relaxed">
            4중 구조 길고양이 야외 보호 셸터
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink/90"
            >
              지금 보기 →
            </Link>
            <Link
              href="#layer4"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/80 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-ink"
            >
              4중 구조 알아보기
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1%, -1%);
          }
        }
        .ken-burns {
          animation: ken-burns 12s ease-in-out infinite alternate;
          transform-origin: center center;
        }
        @media (prefers-reduced-motion: reduce) {
          .ken-burns {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
