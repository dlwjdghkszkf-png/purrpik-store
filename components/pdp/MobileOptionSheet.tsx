"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { Database, ProductVariants } from "@/lib/supabase/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  editionLabel,
  findSku,
  formatPrice,
} from "@/lib/products/format";
import { useCartStore } from "@/lib/cart/store";
import { trackAddToCart } from "@/lib/analytics";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Sku = ProductVariants["skus"][number];

const MIN_QTY = 1;
const MAX_QTY = 99;

/**
 * MobileOptionSheet — Stage 19: 모바일 전용 옵션 선택 바텀시트.
 *
 * 한국 D2C 패턴 (쿠팡·무신사·29CM). 카드형 큰 옵션(라디오 X)·sticky CTA.
 * 데스크탑에서는 lg:hidden — 데스크탑은 일반 OptionPicker 사용.
 * 이모지 금지 (전역 룰) → lucide 아이콘.
 *
 * Trigger는 StickyBuyBar 모바일 "옵션 선택" 버튼 (open prop으로 제어).
 */
interface Props {
  product: ProductRow;
  variants: ProductVariants;
  initialSku?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileOptionSheet({
  product,
  variants,
  initialSku,
  open,
  onOpenChange,
}: Props) {
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
  const [added, setAdded] = useState(false);

  const selectedSku = useMemo(
    () => findSku(variants, selection),
    [variants, selection],
  );

  const addItem = useCartStore((s) => s.addItem);
  const openMiniCart = useCartStore((s) => s.setOpen);

  const unitPrice = selectedSku?.price ?? product.price;
  const total = unitPrice * qty;
  const disabled = !selectedSku;

  const dec = () => setQty((q) => Math.max(MIN_QTY, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_QTY, q + 1));
  const setAxis = (axisId: string, optionId: string) =>
    setSelection((prev) => ({ ...prev, [axisId]: optionId }));

  const variantLabel = (sku: Sku) =>
    `${editionLabel(sku.edition)} ${sku.size}`;

  const handleAdd = () => {
    if (!selectedSku) return;
    const itemName = `${product.name} · ${variantLabel(selectedSku)}`;
    addItem({
      productId: product.id,
      variantId: selectedSku.id,
      name: itemName,
      price: unitPrice,
      quantity: qty,
      hero_image: product.hero_image ?? "",
    });
    trackAddToCart({
      item_id: selectedSku.id,
      item_name: itemName,
      price: unitPrice,
      quantity: qty,
    });
    setAdded(true);
    window.setTimeout(() => {
      setAdded(false);
      onOpenChange(false);
      openMiniCart(true);
    }, 500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="lg:hidden p-0 max-h-[90vh] flex flex-col rounded-t-2xl"
      >
        {/* 핸들바 */}
        <div className="flex items-center justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        </div>

        <SheetHeader className="px-5 pt-1 pb-3 border-b border-line flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-left text-base font-semibold">
            옵션 선택
          </SheetTitle>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
            className="p-1 text-mute-1 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {variants.axes.map((axis) => (
            <fieldset key={axis.id} className="space-y-2">
              <legend className="text-small font-medium text-ink">
                {axis.label}
              </legend>
              <div
                role="radiogroup"
                aria-label={axis.label}
                className="grid grid-cols-2 gap-2.5"
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
                      className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-4 text-left transition-colors min-h-[72px] ${
                        active
                          ? "border-ink bg-ink/[0.04] ring-1 ring-ink"
                          : "border-line bg-white hover:border-ink/60"
                      }`}
                    >
                      <span className="text-base font-semibold text-ink leading-tight">
                        {opt.label}
                      </span>
                      {opt.sub && (
                        <span className="text-[11px] text-mute-1">
                          {opt.sub}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* 선택 요약 */}
          <div className="rounded-md border border-line bg-zinc-50 p-3">
            {selectedSku ? (
              <div className="space-y-1.5">
                <p className="text-small font-medium text-mute-1">
                  {variantLabel(selectedSku)}
                </p>
                <p className="text-[11px] text-mute-2">
                  외부 {selectedSku.size_outer} · 입구 {selectedSku.size_entry}
                </p>
                <p className="text-[11px] text-mute-2">
                  구성: {selectedSku.includes.join(" + ")}
                </p>
              </div>
            ) : (
              <p className="text-small text-mute-1">
                해당 조합이 없습니다. 옵션을 다시 선택해주세요.
              </p>
            )}
          </div>

          {/* 수량 */}
          <div className="flex items-center justify-between gap-4 border-y border-line py-3">
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
        </div>

        {/* sticky CTA */}
        <div className="border-t border-line bg-white px-5 py-3">
          <Button
            type="button"
            variant="mustard"
            onClick={handleAdd}
            disabled={disabled}
            className="h-12 w-full text-base"
            aria-live="polite"
          >
            {added ? (
              <>
                <Check className="mr-2 size-5" aria-hidden="true" />
                담겼습니다
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 size-5" aria-hidden="true" />
                {formatPrice(total)} · 장바구니 담기
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
