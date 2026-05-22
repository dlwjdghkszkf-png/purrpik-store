import { Suspense } from "react";
import type { Metadata } from "next";
import { PetGate } from "@/components/gate/PetGate";

/**
 * Stage 17 v3 — 루트 게이트 페이지.
 *
 * - 신규 진입(localStorage 없음) → 3 카드 게이트 표시
 * - 기존 선택 있음(localStorage hit) → useEffect에서 자동 `/${petType}` redirect
 * - `?gate=1` 강제 진입 시 redirect 스킵하고 게이트 노출
 *
 * 기존 홈(VideoHero 등)은 `/cat`으로 이전됨.
 */

export const metadata: Metadata = {
  title: "푸르픽 — 반려동물 보호 셸터",
  description:
    "고양이·강아지 모두를 위한 푸르픽. 반려동물을 선택하고 카테고리별 큐레이션을 확인하세요.",
  openGraph: {
    title: "푸르픽 — 반려동물 보호 셸터",
    description:
      "고양이·강아지 모두를 위한 푸르픽. 반려동물을 선택하고 카테고리별 큐레이션을 확인하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function GatePage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" aria-hidden="true" />}>
      <PetGate />
    </Suspense>
  );
}
