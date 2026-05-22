import type { Metadata } from "next";
import { ComingSoonHero } from "@/components/dog/ComingSoonHero";

/**
 * Stage 17 v3 — /dog placeholder.
 *
 * 강아지 라인업 출시 전까지 hero + 뉴스레터 + 인스타 + /cat 링크만 노출.
 * P2: 사용자 강아지 신상품 추가 시 정식 카테고리 홈으로 전환 (project_purrpik 메모 참조).
 */

export const metadata: Metadata = {
  title: "강아지 — 푸르픽 (준비 중)",
  description:
    "푸르픽이 곧 강아지 라인업을 선보입니다. 출시 알림을 받아보세요.",
};

export const revalidate = 86400;

export default function DogHome() {
  return <ComingSoonHero />;
}
