"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { selectCartCount, useCartStore } from "@/lib/cart/store";

// metadata는 client page에서 export 불가 — title은 useEffect로 set.
const PAGE_TITLE = "장바구니 — 푸르픽";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectCartCount);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    document.title = PAGE_TITLE;
  }, []);

  // hydration 전 빈 카트 깜빡임 방지 — 로딩 placeholder.
  if (!hydrated) {
    return (
      <div className="container-page py-16">
        <div className="h-6 w-32 rounded bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>장바구니</span>
        </nav>
        <h1 className="mt-3">
          장바구니{count > 0 && <span className="text-mute-1 font-normal"> ({count}건)</span>}
        </h1>
      </header>

      <section className="container-page pb-20">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <ul className="divide-y divide-line border-y border-line">
              {items.map((it) => (
                <CartLine key={it.productId} item={it} />
              ))}
            </ul>

            <CartSummary />
          </div>
        )}
      </section>
    </>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center text-center py-20 rounded-lg border border-line bg-white">
      <p className="text-xl font-semibold text-ink">
        장바구니가 비어있습니다
      </p>
      <p className="mt-3 text-sm text-mute-1">
        푸르픽 길고양이집을 둘러보세요.
      </p>
      <Button
        asChild
        variant="mustard"
        size="lg"
        className="mt-8 h-12 px-8"
      >
        <Link href="/shop">전체 상품 보기</Link>
      </Button>
    </div>
  );
}
