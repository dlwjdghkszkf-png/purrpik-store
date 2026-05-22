"use client";

/**
 * Stage 17 v3 — Multi-pet 게이트 펫 선호 저장소.
 *
 * localStorage 키: `purrpik-pet-type` (zustand persist).
 * `/` 게이트에서 카드 선택 시 저장 → 다음 방문 시 자동 redirect.
 * 헤더 PetTypeBadge X 버튼 또는 `/?gate=1` 진입 시 clear.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PetType = "cat" | "dog" | "both";

interface PetTypeStore {
  petType: PetType | null;
  /** localStorage hydration 완료 여부 — SSR/CSR 불일치 방지용 */
  hydrated: boolean;
  setPetType: (t: PetType) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const usePetTypeStore = create<PetTypeStore>()(
  persist(
    (set) => ({
      petType: null,
      hydrated: false,
      setPetType: (petType) => set({ petType }),
      clear: () => set({ petType: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "purrpik-pet-type",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as never)
      ),
      partialize: (s) => ({ petType: s.petType }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/** PetType → 한글 라벨 (헤더 배지/링크 텍스트용) */
export const petTypeLabel: Record<PetType, string> = {
  cat: "고양이",
  dog: "강아지",
  both: "강아지·고양이",
};

/** PetType → 해당 카테고리 홈 경로 */
export const petTypeHref: Record<PetType, string> = {
  cat: "/cat",
  dog: "/dog",
  both: "/both",
};
