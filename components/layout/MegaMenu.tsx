"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Cat, Dog, PawPrint, type LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { label: string; href: string; hasMega?: boolean };

const NAV: NavItem[] = [
  { label: "Shop", href: "/shop", hasMega: true },
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

type PetPanelItem = {
  type: "cat" | "dog" | "both";
  title: string;
  desc: string;
  href: string;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIcon;
};

const PET_PANELS: PetPanelItem[] = [
  {
    type: "cat",
    title: "고양이",
    desc: "4중 구조 야외 셸터 4 에디션",
    href: "/cat",
    ctaLabel: "고양이 전체",
    ctaHref: "/cat",
    icon: Cat,
  },
  {
    type: "dog",
    title: "강아지",
    desc: "신상품 준비 중",
    href: "/dog",
    ctaLabel: "알림 받기",
    ctaHref: "/dog",
    icon: Dog,
  },
  {
    type: "both",
    title: "둘 다",
    desc: "호환 부속 제품",
    href: "/both",
    ctaLabel: "둘 다 보기",
    ctaHref: "/both",
    icon: PawPrint,
  },
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
                By Pet
              </div>
              {PET_PANELS.map((p) => (
                <Link
                  key={p.type}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2 text-sm text-mute-1 hover:text-ink transition-colors flex items-center gap-2"
                >
                  <p.icon className="w-4 h-4 text-brand-mustard" aria-hidden="true" />
                  {p.title}
                  <span className="block text-[11px] text-mute-2">
                    — {p.desc}
                  </span>
                </Link>
              ))}

              <div className="mt-2 px-4 py-2 text-xs font-semibold tracking-widest text-mute-1 uppercase">
                Cat — Editions
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

              <div className="mt-3 px-4 py-2 border-t border-line">
                <Link
                  href="/?gate=1"
                  onClick={() => setMobileOpen(false)}
                  className="text-xs text-mute-2 hover:text-ink transition-colors underline underline-offset-4"
                >
                  반려동물 다시 선택하기
                </Link>
              </div>
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

        {/* Shop mega panel — 3 카테고리 (cat / dog / both) */}
        {hovered === "Shop" && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-b border-line shadow-lg z-40"
            onMouseEnter={() => setHovered("Shop")}
          >
            <div className="container-page py-8 grid grid-cols-12 gap-8">
              {PET_PANELS.map((p) => (
                <div key={p.type} className="col-span-4">
                  <div className="flex items-center gap-2 mb-4">
                    <p.icon
                      className="w-5 h-5 text-brand-mustard"
                      aria-hidden="true"
                    />
                    <div className="text-xs font-semibold tracking-widest text-mute-1 uppercase">
                      {p.title}
                    </div>
                  </div>

                  {p.type === "cat" ? (
                    <div className="grid grid-cols-2 gap-3">
                      {SHELTER_EDITIONS.map((ed) => (
                        <Link
                          key={ed.id}
                          href={`/shop/${ed.id}`}
                          className="group block p-2 -m-2 rounded-md hover:bg-secondary transition-colors"
                        >
                          <div className="text-sm font-semibold text-ink group-hover:text-brand-mustard">
                            {ed.label}
                          </div>
                          <div className="text-xs text-mute-1 mt-0.5">
                            {ed.desc}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-mute-1 leading-relaxed">
                      {p.desc}
                    </p>
                  )}

                  <Link
                    href={p.ctaHref}
                    className="mt-4 inline-block text-sm font-medium text-brand-mustard hover:underline underline-offset-4"
                  >
                    {p.ctaLabel} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
