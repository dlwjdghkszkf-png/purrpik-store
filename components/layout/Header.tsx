"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Search, ShoppingBag } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import { selectCartCount, useCartStore } from "@/lib/cart/store";

export function Header() {
  const setOpen = useCartStore((s) => s.setOpen);
  const count = useCartStore(selectCartCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBadge = mounted && count > 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="container-page relative">
        <div className="h-16 grid grid-cols-3 items-center">
          {/* 좌측: 메가메뉴 */}
          <div className="flex items-center">
            <MegaMenu />
          </div>

          {/* 중앙: 로고 */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="font-bold text-2xl tracking-tight text-ink"
              aria-label="푸르픽 홈"
            >
              푸르픽
            </Link>
          </div>

          {/* 우측: 아이콘 그룹 */}
          <div className="flex items-center justify-end gap-4 md:gap-5">
            <button
              type="button"
              aria-label="검색"
              onClick={() => console.log("TODO: search")}
              className="text-ink hover:text-brand-mustard transition-colors p-1"
            >
              <Search className="w-6 h-6" />
            </button>

            <Link
              href="/orders/lookup"
              aria-label="주문 조회"
              className="text-ink hover:text-brand-mustard transition-colors p-1 flex items-center gap-1.5"
            >
              <Package className="w-6 h-6" />
              <span className="hidden md:inline text-sm font-medium">
                주문조회
              </span>
            </Link>

            <button
              type="button"
              aria-label={`장바구니 (${count}개)`}
              onClick={() => setOpen(true)}
              className="relative text-ink hover:text-brand-mustard transition-colors p-1"
            >
              <ShoppingBag className="w-6 h-6" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-mustard text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
