"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * Gallery — PDP 이미지 갤러리 (Client).
 *
 * 메인 이미지 + 썸네일 그리드. 썸네일 클릭으로 메인 변경.
 * Stage 14에서 next/image 전환 예정. 현재는 placeholder + img.
 */
export function Gallery({ product }: { product: ProductRow }) {
  const gallery: string[] = Array.isArray(product.gallery)
    ? (product.gallery as string[])
    : [];
  const images: string[] = [
    product.hero_image ?? "",
    ...gallery.filter((g) => g && g !== product.hero_image),
  ].filter(Boolean);

  // hero/gallery 비어있을 때도 1개 placeholder 유지.
  const list = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);
  const main = list[active] ?? "";

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={main}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
            <span className="text-mute-2 text-small">{product.name}</span>
          </div>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`이미지 ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md bg-zinc-100 transition",
                i === active
                  ? "ring-2 ring-brand-mustard ring-offset-2"
                  : "ring-1 ring-line hover:ring-zinc-300",
              )}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-mute-2">
                  IMG
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
