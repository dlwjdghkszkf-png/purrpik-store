"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart/store";
import { formatPrice } from "@/lib/products/format";

export function CartSummary() {
  const subtotal = useCartStore(selectCartSubtotal);
  // 푸르픽 정책: 전상품 무료배송 (spec sec 4). 다크패턴 회피 — 가격 1회만 강조.
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <aside className="rounded-lg border border-line bg-white p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-ink">주문 요약</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-mute-1">상품 합계</dt>
          <dd className="tabular-nums text-ink">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-mute-1">배송비</dt>
          <dd className="text-ink">무료</dd>
        </div>
      </dl>

      <Separator className="my-5" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-mute-1">총 결제 금액</span>
        <span className="text-2xl font-bold text-ink tabular-nums">
          {formatPrice(total)}
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <Button
          asChild
          variant="mustard"
          size="lg"
          className="w-full h-12 text-base"
        >
          <Link href="/checkout">결제하기</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full h-11"
        >
          <Link href="/shop">쇼핑 계속하기</Link>
        </Button>
      </div>

      <p className="mt-5 text-xs text-mute-2 leading-relaxed">
        전상품 무료배송 · 30일 만족보증 · 무료반품
      </p>
    </aside>
  );
}
