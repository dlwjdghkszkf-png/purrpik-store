"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";

export type CookieConsent = "accepted" | "declined" | null;

/** 다른 컴포넌트(GA/Pixel)가 동의 상태를 확인할 때 사용 */
export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "accepted" || v === "declined") return v;
  return null;
}

/** 동의 상태 변경 이벤트 hook (Stage 14 GA 활성화용) */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    setConsent(getCookieConsent());
    const onAccept = () => setConsent("accepted");
    const onDecline = () => setConsent("declined");
    window.addEventListener("cookie-consent-accepted", onAccept);
    window.addEventListener("cookie-consent-declined", onDecline);
    return () => {
      window.removeEventListener("cookie-consent-accepted", onAccept);
      window.removeEventListener("cookie-consent-declined", onDecline);
    };
  }, []);

  return consent;
}

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (!v) setVisible(true);
  }, []);

  function accept() {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new CustomEvent("cookie-consent-accepted"));
    setVisible(false);
  }

  function decline() {
    window.localStorage.setItem(STORAGE_KEY, "declined");
    window.dispatchEvent(new CustomEvent("cookie-consent-declined"));
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="쿠키 동의"
      className="fixed bottom-0 inset-x-0 z-[60] bg-ink text-white border-t border-white/10 shadow-lg"
    >
      <div className="container-page py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
          푸르픽은 더 나은 경험을 위해 쿠키와 행태정보를 수집합니다.
          마케팅·분석 쿠키 사용에 동의하시겠습니까?{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-white"
          >
            자세히
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={decline}
            className="h-9 text-white hover:bg-white/10 hover:text-white"
          >
            거부
          </Button>
          <Button
            type="button"
            variant="mustard"
            size="lg"
            onClick={accept}
            className="h-9"
          >
            동의
          </Button>
        </div>
      </div>
    </div>
  );
}
