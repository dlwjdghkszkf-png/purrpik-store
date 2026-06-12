"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const COL_SHOP = [
  { label: "전체 상품", href: "/shop" },
  { label: "고양이", href: "/cat" },
  { label: "강아지", href: "/dog" },
  { label: "강아지·고양이 둘 다", href: "/both" },
  { label: "푸르픽 길고양이집", href: "/shop/purrpik-shelter" },
  { label: "BASIC M", href: "/shop/purrpik-shelter?sku=basic-m" },
  { label: "BASIC L", href: "/shop/purrpik-shelter?sku=basic-l" },
  { label: "ALL-IN-ONE M", href: "/shop/purrpik-shelter?sku=allinone-m" },
  { label: "ALL-IN-ONE L", href: "/shop/purrpik-shelter?sku=allinone-l" },
  { label: "Give Back", href: "/give-back" },
];

const COL_INFO = [
  { label: "브랜드 스토리", href: "/about" },
  { label: "길냥이 돌봄 가이드", href: "/care-guide" },
  { label: "매거진", href: "/articles" },
  { label: "리뷰", href: "/reviews" },
  {
    label: "인스타그램",
    href: "https://instagram.com/purrpik",
    external: true,
  },
];

const COL_HELP = [
  { label: "고객 문의", href: "mailto:help@purrpik.co.kr" },
  { label: "FAQ", href: "/faq" },
  { label: "배송·교환·환불", href: "/faq#shipping" },
  { label: "주문 조회", href: "/orders/lookup" },
  { label: "반려동물 다시 선택", href: "/?gate=1" },
];

const LEGAL = [
  { label: "사업자정보", href: "/business-info" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
];

type SubscribeStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function Footer() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<SubscribeStatus>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setStatus({
        kind: "error",
        message: "마케팅 정보 수신에 동의해주세요.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", consent: agreed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        const msg =
          data.error === "invalid_email"
            ? "올바른 이메일 주소를 입력해주세요."
            : data.error === "consent_required"
              ? "마케팅 정보 수신에 동의해주세요."
              : "문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        setStatus({ kind: "error", message: msg });
        return;
      }

      if (data.alreadySubscribed) {
        setStatus({ kind: "success", message: "이미 가입되어 있습니다." });
      } else {
        setStatus({
          kind: "success",
          message: "가입 완료! 첫 소식을 곧 보내드릴게요.",
        });
      }
      setEmail("");
      setAgreed(false);
    } catch {
      setStatus({
        kind: "error",
        message: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <footer className="border-t border-line bg-white mt-20">
      <div className="container-page py-12 md:py-16">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-ink uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {COL_SHOP.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-mute-1 hover:text-ink transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest text-ink uppercase mb-4">
              Info
            </h3>
            <ul className="space-y-2.5">
              {COL_INFO.map((l) => (
                <li key={l.href}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-mute-1 hover:text-ink transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-sm text-mute-1 hover:text-ink transition-colors"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest text-ink uppercase mb-4">
              Help
            </h3>
            <ul className="space-y-2.5">
              {COL_HELP.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-mute-1 hover:text-ink transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 뉴스레터 */}
        <div className="border-t border-line pt-10 mb-10">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-ink mb-2">Join the Pack</h3>
            <p className="text-sm text-mute-1 mb-4">
              신상품, 한정 에디션, 길냥이 돌봄 팁을 가장 먼저 받아보세요.
            </p>
            <form
              action="/api/newsletter/subscribe"
              method="post"
              onSubmit={handleSubmit}
              className="space-y-3"
              noValidate
            >
              <div className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="flex-1 h-11"
                  aria-label="이메일 주소"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="h-11 px-6"
                  disabled={loading || !agreed || !email}
                >
                  {loading ? "가입 중…" : "가입"}
                </Button>
              </div>
              <label className="flex items-center gap-2 text-xs text-mute-1 cursor-pointer">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  aria-label="마케팅 수신 동의 (필수)"
                  disabled={loading}
                />
                마케팅 정보 수신에 동의합니다 (필수)
              </label>
              {status.kind === "success" && (
                <p
                  role="status"
                  className="text-xs text-emerald-600"
                  aria-live="polite"
                >
                  {status.message}
                </p>
              )}
              {status.kind === "error" && (
                <p
                  role="alert"
                  className="text-xs text-red-600"
                  aria-live="assertive"
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* 소셜 + 법적 */}
        <div className="border-t border-line pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/purrpik"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="인스타그램"
              className="text-mute-1 hover:text-ink transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-xs text-mute-2 hover:text-ink transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 사업자정보 + 카피라이트 */}
        <div className="mt-6 space-y-1">
          <p className="text-[11px] text-mute-2 leading-relaxed">
            (주)신성컴퍼니 | 사업자등록번호: 000-00-00000 | 통신판매업신고:
            제0000-서울00-0000호
          </p>
          <p className="text-[11px] text-mute-2">
            © 2026 푸르픽. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
