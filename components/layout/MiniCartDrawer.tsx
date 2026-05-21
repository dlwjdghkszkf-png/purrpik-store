"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart/store";

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n) + "원";
}

export function MiniCartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 py-4 border-b border-line">
          <SheetTitle className="text-left text-lg font-bold flex items-center gap-2">
            장바구니
            <span className="text-sm font-normal text-mute-1">({count})</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-mute-1 mb-6">
              장바구니가 비어있습니다
            </p>
            <Button
              asChild
              variant="outline"
              onClick={() => setOpen(false)}
            >
              <Link href="/shop">쇼핑 계속하기</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="divide-y divide-line">
                {items.map((it) => (
                  <li key={it.productId} className="p-4 flex gap-3">
                    <div className="w-[50px] h-[50px] shrink-0 bg-secondary rounded-md overflow-hidden flex items-center justify-center text-[10px] text-mute-2">
                      {it.hero_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.hero_image}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "IMG"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">
                        {it.name}
                      </div>
                      <div className="text-xs text-mute-1 mt-0.5">
                        {formatKRW(it.price)}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-line rounded-md">
                          <button
                            type="button"
                            aria-label="수량 감소"
                            onClick={() =>
                              updateQty(it.productId, it.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-secondary"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="수량 증가"
                            onClick={() =>
                              updateQty(it.productId, it.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-secondary"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="삭제"
                          onClick={() => removeItem(it.productId)}
                          className="p-1 text-mute-1 hover:text-ink"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t border-line px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mute-1">합계</span>
                <span className="text-xl font-bold text-ink">
                  {formatKRW(subtotal)}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button
                  asChild
                  variant="mustard"
                  size="lg"
                  className="w-full h-11"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout">결제하기</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full h-11"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/cart">장바구니 보기</Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm text-mute-1 hover:text-ink py-1"
                >
                  쇼핑 계속하기
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
