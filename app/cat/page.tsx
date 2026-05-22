import type { Metadata } from "next";
import { VideoHero } from "@/components/home/VideoHero";
import { EditionGrid } from "@/components/home/EditionGrid";
import { Layer4 } from "@/components/home/Layer4";
import { TestStats } from "@/components/home/TestStats";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
import { FaqSection } from "@/components/home/FaqSection";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { GiveBack } from "@/components/home/GiveBack";

/**
 * Stage 17 v3 — 고양이 카테고리 홈.
 *
 * 기존 v2 홈(`/`)의 8 섹션을 그대로 이전. 게이트 카드에서 cat 선택 시 도달.
 * metadata title만 "고양이 — 푸르픽"로 변경.
 */

export const metadata: Metadata = {
  title: "고양이 — 푸르픽 길고양이 보호 셸터 | 4중 구조 야외 셸터",
  description:
    "옥스포드 600D · TPU · EPE Foam · AL Foil 4중 레이어로 비·바람·열기를 막는 길고양이 보호 셸터. 60초 설치, 70kg 하중. 무료배송.",
  openGraph: {
    title: "고양이 — 푸르픽 길고양이 보호 셸터",
    description:
      "옥스포드 600D · TPU · EPE Foam · AL Foil 4중 레이어로 비·바람·열기를 막는 길고양이 보호 셸터. 60초 설치, 70kg 하중. 무료배송.",
    type: "website",
    locale: "ko_KR",
  },
};

// 24h ISR — 제품·FAQ·리뷰는 일 단위로만 변경.
export const revalidate = 86400;

export default function CatHome() {
  return (
    <>
      <VideoHero />
      <EditionGrid />
      <Layer4 />
      <TestStats />
      <ReviewsCarousel />
      <FaqSection />
      <InstagramFeed />
      <GiveBack />
    </>
  );
}
