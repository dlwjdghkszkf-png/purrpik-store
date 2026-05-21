"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SizeFilter = "M" | "L";
type EditionFilter = "BASIC" | "ALL_IN_ONE";

const SIZE_OPTIONS: { value: SizeFilter | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
];

const EDITION_OPTIONS: { value: EditionFilter | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "BASIC", label: "BASIC" },
  { value: "ALL_IN_ONE", label: "ALL-IN-ONE" },
];

/**
 * FilterBar — /shop 카탈로그 사이즈/에디션 필터.
 *
 * URL searchParams (?size=M&edition=BASIC)에 상태 반영 → 서버 RSC가 다시 fetch.
 * 활성 필터는 default(black fill), 비활성은 outline.
 */
export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSize = (searchParams.get("size") as SizeFilter | null) ?? "ALL";
  const currentEdition =
    (searchParams.get("edition") as EditionFilter | null) ?? "ALL";

  const hasActiveFilter = currentSize !== "ALL" || currentEdition !== "ALL";

  const update = useCallback(
    (key: "size" | "edition", value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === "ALL") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const isActive = useMemo(
    () => ({
      size: (v: string) => v === currentSize,
      edition: (v: string) => v === currentEdition,
    }),
    [currentSize, currentEdition]
  );

  return (
    <div className="flex flex-col gap-4 border-y border-line py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
        <FilterGroup
          label="사이즈"
          options={SIZE_OPTIONS}
          isActive={isActive.size}
          onSelect={(v) => update("size", v)}
        />
        <FilterGroup
          label="에디션"
          options={EDITION_OPTIONS}
          isActive={isActive.edition}
          onSelect={(v) => update("edition", v)}
        />
      </div>
      {hasActiveFilter && (
        <button
          type="button"
          onClick={reset}
          className="self-start text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep md:self-auto"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  isActive,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  isActive: (value: string) => boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <span className="text-small font-medium text-mute-1">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isActive(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => onSelect(opt.value)}
              aria-pressed={active}
              className={cn("min-w-[3.5rem]")}
            >
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
