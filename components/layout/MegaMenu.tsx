"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Shelter", href: "/shop" },
  { label: "Reviews", href: "/reviews" },
  { label: "Care Guide", href: "/care-guide" },
  { label: "About", href: "/about" },
];

const SHELTER_EDITIONS = [
  { id: "basic-m", label: "BASIC M", desc: "한 마리 전용 베이직" },
  { id: "basic-l", label: "BASIC L", desc: "두 마리까지 베이직" },
  { id: "allinone-m", label: "ALL-IN-ONE M", desc: "패드 포함 풀세트" },
  { id: "allinone-l", label: "ALL-IN-ONE L", desc: "풀세트 라지" },
];

export function MegaMenu() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 모바일 햄버거 */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            aria-label="메뉴 열기"
            className="p-2 -ml-2 text-ink hover:text-brand-mustard transition-colors"
          >
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0">
            <SheetHeader className="p-6 border-b border-line">
              <SheetTitle className="text-left text-xl font-bold">
                메뉴
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-ink hover:bg-secondary rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 px-4 py-2 text-xs font-semibold tracking-widest text-mute-1 uppercase">
                By Edition
              </div>
              {SHELTER_EDITIONS.map((ed) => (
                <Link
                  key={ed.id}
                  href={`/shop/${ed.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-sm text-mute-1 hover:text-ink transition-colors"
                >
                  {ed.label}
                  <span className="block text-[11px] text-mute-2">
                    {ed.desc}
                  </span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크탑 네비게이션 */}
      <nav
        className="hidden md:flex items-center gap-8"
        onMouseLeave={() => setHovered(null)}
      >
        {NAV.map((item) => (
          <div
            key={item.href}
            onMouseEnter={() => setHovered(item.label)}
            className="py-5"
          >
            <Link
              href={item.href}
              className="text-sm font-medium text-ink hover:text-brand-mustard transition-colors relative"
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-mustard origin-left transition-transform duration-200 ${
                  hovered === item.label ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          </div>
        ))}

        {/* Shelter mega panel */}
        {hovered === "Shelter" && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-b border-line shadow-lg z-40"
            onMouseEnter={() => setHovered("Shelter")}
          >
            <div className="container-page py-8 grid grid-cols-12 gap-8">
              <div className="col-span-7">
                <div className="text-xs font-semibold tracking-widest text-mute-1 uppercase mb-4">
                  By Edition
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SHELTER_EDITIONS.map((ed) => (
                    <Link
                      key={ed.id}
                      href={`/shop/${ed.id}`}
                      className="group block p-3 -m-3 rounded-md hover:bg-secondary transition-colors"
                    >
                      <div className="text-base font-semibold text-ink group-hover:text-brand-mustard">
                        {ed.label}
                      </div>
                      <div className="text-sm text-mute-1 mt-0.5">
                        {ed.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="col-span-5 border-l border-line pl-8">
                <div className="text-xs font-semibold tracking-widest text-mute-1 uppercase mb-4">
                  Featured
                </div>
                <Link
                  href="/shop/allinone-l"
                  className="group block"
                >
                  <div className="w-40 h-30 bg-secondary rounded-md mb-3 overflow-hidden flex items-center justify-center text-xs text-mute-2">
                    ALL-IN-ONE L
                  </div>
                  <div className="text-sm font-semibold text-ink">
                    실구매자 다수 선택
                  </div>
                  <div className="text-sm text-brand-mustard mt-1 group-hover:underline">
                    지금 보기 →
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
