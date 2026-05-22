"use client";

/**
 * Stage 17 v3 — PetGate 단일 카드.
 *
 * 클릭 시:
 *   1) usePetTypeStore.setPetType(type) → localStorage 저장
 *   2) router.push(`/${type}`) → 카테고리 홈 이동
 *
 * 시각:
 *   - 큰 카드 (mobile aspect-[4/5], desktop aspect-square)
 *   - 상단 lucide 아이콘 (mustard 톤), 중앙 한글 타이틀, 짧은 설명, 하단 CTA
 *   - hover: 보더/그림자/아이콘 살짝 확대
 */

import { useRouter } from "next/navigation";
import { Cat, Dog, PawPrint, ArrowRight, type LucideIcon } from "lucide-react";
import { usePetTypeStore, petTypeHref, type PetType } from "@/lib/pet-type/store";
import { cn } from "@/lib/utils";

const ICONS: Record<PetType, LucideIcon> = {
  cat: Cat,
  dog: Dog,
  both: PawPrint,
};

export interface PetCardProps {
  type: PetType;
  title: string;
  description: string;
  ctaLabel: string;
}

export function PetCard({ type, title, description, ctaLabel }: PetCardProps) {
  const router = useRouter();
  const setPetType = usePetTypeStore((s) => s.setPetType);
  const Icon = ICONS[type];

  const handleClick = () => {
    setPetType(type);
    router.push(petTypeHref[type]);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${title} 선택`}
      data-pet-type={type}
      className={cn(
        "group relative flex flex-col items-center justify-between",
        "aspect-[4/5] md:aspect-square w-full",
        "rounded-2xl border border-line bg-white",
        "p-6 md:p-8 lg:p-10 text-left",
        "transition-all duration-200",
        "hover:border-ink hover:shadow-lg hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mustard"
      )}
    >
      {/* 상단: 아이콘 */}
      <div
        className={cn(
          "flex items-center justify-center w-full",
          "h-32 md:h-40 lg:h-48",
          "rounded-xl bg-secondary",
          "transition-transform duration-200 group-hover:scale-[1.02]"
        )}
        aria-hidden="true"
      >
        <Icon className="w-20 h-20 md:w-24 md:h-24 text-brand-mustard" strokeWidth={1.5} />
      </div>

      {/* 중앙: 타이틀 + 설명 */}
      <div className="w-full text-center mt-6 md:mt-8 flex-1 flex flex-col justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-ink">{title}</h2>
        <p className="mt-3 text-sm md:text-base text-mute-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* 하단: CTA */}
      <div
        className={cn(
          "mt-6 w-full inline-flex items-center justify-center gap-2",
          "h-12 px-6 rounded-md",
          "bg-brand-mustard text-white font-semibold text-sm md:text-base",
          "transition-colors group-hover:bg-brand-mustard-deep"
        )}
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </button>
  );
}
