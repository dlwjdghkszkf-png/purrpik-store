"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Database, ProductVariants } from "@/lib/supabase/types";
import {
  editionLabel,
  findSku,
  formatPrice,
} from "@/lib/products/format";
import { AddToCartButton } from "./AddToCartButton";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const MIN_QTY = 1;
const MAX_QTY = 99;

interface Props {
  product: ProductRow;
  variants: ProductVariants;
  initialSku?: string;
}

/**
 * OptionPicker — Stage 18 리팩.
 *
 * 2 axes 라디오(에디션·사이즈) → findSku → selectedSku.
 * selectedSku 따라 가격·외부 사이즈·구성품·AddToCart payload 모두 동적 업데이트.
 */
export function OptionPicker({ product, variants, initialSku }: Props) {
  // 초기 선택 — initialSku 우선, 없으면 첫 SKU의 조합으로.
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const seed =
      (initialSku && variants.skus.find((s) => s.id === initialSku)) ||
      variants.skus[0];
    const init: Record<string, string> = {};
    for (const axis of variants.axes) {
      init[axis.id] = seed
        ? (seed as unknown as Record<string, string>)[axis.id]
        : axis.options[0]?.id ?? "";
    }
    return init;
  });

  const [qty, setQty] = useState(1);

  const selectedSku = useMemo(
    () => findSku(variants, selection),
    [variants, selection],
  );

  const dec = () => setQty((q) => Math.max(MIN_QTY, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_QTY, q + 1));

  const setAxis = (axisId: string, optionId: string) =>
    setSelection((prev) => ({ ...prev, [axisId]: optionId }));

  return (
    <div className="mt-8 space-y-6">
      {/* 2 axes 라디오 */}
      {variants.axes.map((axis) => (
        <fieldset key={axis.id} className="space-y-3">
          <legend className="flex items-baseline justify-between gap-2 text-small font-medium text-ink">
            <span>{axis.label}</span>
            <span className="text-mute-2 text-[11px] font-normal">
              현재: {selection[axis.id] === "ALL_IN_ONE" ? "ALL-IN-ONE" : selection[axis.id]}
            </span>
          </legend>
          <div
            role="radiogroup"
            aria-label={axis.label}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {axis.options.map((opt) => {
              const active = selection[axis.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAxis(axis.id, opt.id)}
                  className={`flex flex-col items-start gap-1 rounded-md border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-ink bg-ink/[0.04] ring-1 ring-ink"
                      : "border-line bg-white hover:border-ink/60"
                  }`}
                >
                  <span className="text-base font-semibold text-ink">
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span className="text-[11px] text-mute-1">{opt.sub}</span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* 선택된 SKU 요약 — 가격·외부 사이즈·구성품 */}
      <div className="rounded-md border border-line bg-zinc-50 p-4">
        {selectedSku ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-small font-medium text-mute-1">
                선택: {editionLabel(selectedSku.edition)} · {selectedSku.size}
              </p>
              <p className="text-h3 font-semibold tabular-nums text-ink">
                {formatPrice(selectedSku.price)}
              </p>
            </div>
            <p className="text-[11px] text-mute-2">
              외부 {selectedSku.size_outer} · 입구 {selectedSku.size_entry}
            </p>
            <p className="text-[11px] text-mute-2">
              구성: {selectedSku.includes.join(" + ")}
            </p>
          </div>
        ) : (
          <p className="text-small text-mute-1">
            해당 조합 상품이 없습니다. 옵션을 다시 선택해주세요.
          </p>
        )}
      </div>

      {/* 수량 */}
      <div className="flex items-center justify-between gap-4 border-y border-line py-4">
        <span className="text-small font-medium text-ink">수량</span>
        <div className="flex items-center rounded-md border border-line">
          <button
            type="button"
            aria-label="수량 감소"
            onClick={dec}
            disabled={qty <= MIN_QTY}
            className="flex size-10 items-center justify-center text-ink hover:bg-zinc-50 disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-base tabular-nums text-ink">
            {qty}
          </span>
          <button
            type="button"
            aria-label="수량 증가"
            onClick={inc}
            disabled={qty >= MAX_QTY}
            className="flex size-10 items-center justify-center text-ink hover:bg-zinc-50 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <AddToCartButton
        product={product}
        selectedSku={selectedSku ?? null}
        quantity={qty}
      />
    </div>
  );
}
