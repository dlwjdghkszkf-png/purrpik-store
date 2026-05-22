"use client";

/**
 * Stage 17 v3 — 헤더 현재 펫 표시 배지.
 *
 * usePetTypeStore 구독:
 *   - petType 없거나 미하이드레이션 → null 렌더
 *   - 있으면 mustard 작은 배지 + 한글 라벨 + X 아이콘
 *
 * X 클릭 → clear() + router.push('/?gate=1') (게이트 재진입, 강제).
 */

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  usePetTypeStore,
  petTypeLabel,
} from "@/lib/pet-type/store";

export function PetTypeBadge() {
  const router = useRouter();
  const petType = usePetTypeStore((s) => s.petType);
  const hydrated = usePetTypeStore((s) => s.hydrated);
  const clear = usePetTypeStore((s) => s.clear);

  if (!hydrated || !petType) {
    return null;
  }

  const handleReset = () => {
    clear();
    router.push("/?gate=1");
  };

  return (
    <div
      role="status"
      aria-label={`현재 ${petTypeLabel[petType]} 카테고리`}
      className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-full bg-brand-mustard text-white text-xs font-semibold"
      data-testid="pet-type-badge"
      data-pet-type={petType}
    >
      <span>{petTypeLabel[petType]} 보는 중</span>
      <button
        type="button"
        onClick={handleReset}
        aria-label="반려동물 다시 선택"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  );
}
