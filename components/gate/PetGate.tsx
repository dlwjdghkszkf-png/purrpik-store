"use client";

/**
 * Stage 17 v3 — Multi-pet 풀스크린 게이트.
 *
 * 동작:
 *   - mount 후 zustand hydration 완료되면 localStorage `purrpik-pet-type` 확인
 *   - 저장된 petType 있고 URL ?gate=1 없으면 즉시 `/${petType}`로 router.replace (게이트 skip)
 *   - 그 외는 3 카드 게이트 표시
 *
 * 메모:
 *   - layout(Header/Footer) 영향을 받는다 (단순화 옵션은 보류, v3에서 게이트 페이지에서도 동일 레이아웃 사용).
 *   - container-page + py-16~24로 풀스크린 분위기.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PetCard } from "./PetCard";
import { usePetTypeStore, petTypeHref } from "@/lib/pet-type/store";

const CARDS = [
  {
    type: "cat" as const,
    title: "고양이",
    description: "4중 구조 야외 셸터 외 고양이 전용 큐레이션",
    ctaLabel: "고양이 보기",
  },
  {
    type: "dog" as const,
    title: "강아지",
    description: "신상품 준비 중 — 출시 알림을 가장 먼저 받아보세요",
    ctaLabel: "알림 받기",
  },
  {
    type: "both" as const,
    title: "강아지·고양이 둘 다",
    description: "두 반려동물 모두를 위한 호환 제품",
    ctaLabel: "둘 다 보기",
  },
];

export function PetGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petType = usePetTypeStore((s) => s.petType);
  const hydrated = usePetTypeStore((s) => s.hydrated);

  const forceGate = searchParams.get("gate") === "1";

  useEffect(() => {
    if (!hydrated) return;
    if (forceGate) return;
    if (petType) {
      router.replace(petTypeHref[petType]);
    }
  }, [hydrated, forceGate, petType, router]);

  return (
    <section
      aria-labelledby="pet-gate-heading"
      className="container-page py-16 md:py-24 min-h-[80vh] flex flex-col justify-center"
    >
      <header className="text-center max-w-2xl mx-auto">
        <h1
          id="pet-gate-heading"
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink tracking-tight"
        >
          당신의 반려동물은?
        </h1>
        <p className="mt-4 md:mt-6 text-base md:text-lg text-mute-1 leading-relaxed">
          푸르픽이 준비한 반려동물별 큐레이션 — 카드를 선택해주세요
        </p>
      </header>

      <div className="mt-10 md:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
        {CARDS.map((c) => (
          <PetCard
            key={c.type}
            type={c.type}
            title={c.title}
            description={c.description}
            ctaLabel={c.ctaLabel}
          />
        ))}
      </div>

      <div className="mt-10 md:mt-12 text-center">
        <Link
          href="/cat"
          prefetch={false}
          className="text-xs md:text-sm text-mute-2 hover:text-ink transition-colors underline-offset-4 hover:underline"
        >
          한 번 선택해도 언제든 변경할 수 있어요
        </Link>
      </div>
    </section>
  );
}
