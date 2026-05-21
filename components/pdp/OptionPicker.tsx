"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { AddToCartButton } from "./AddToCartButton";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const MIN_QTY = 1;
const MAX_QTY = 99;

/**
 * OptionPicker — quantity selector + AddToCartButton 컨테이너 (Client).
 *
 * MVP: 사이즈/에디션 옵션은 카탈로그에서 별도 카드로 분리.
 * PDP는 단일 상품 → quantity만 노출.
 */
export function OptionPicker({ product }: { product: ProductRow }) {
  const [qty, setQty] = useState(1);

  const dec = () => setQty((q) => Math.max(MIN_QTY, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_QTY, q + 1));

  return (
    <div className="mt-8 space-y-5">
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

      <AddToCartButton product={product} quantity={qty} />
    </div>
  );
}
