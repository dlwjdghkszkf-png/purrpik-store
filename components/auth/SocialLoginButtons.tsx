"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "kakao";

/**
 * 구글·카카오 소셜 로그인 버튼.
 * signInWithOAuth → provider 인증 → /auth/callback → 세션 생성.
 */
export function SocialLoginButtons({ next }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);

  async function signIn(provider: Provider) {
    setLoading(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    // 카카오는 Supabase가 account_email·profile_image·profile_nickname을 기본 요청(고정,
    // 클라이언트 scopes는 append만 됨). account_email 동의항목은 비즈앱 승인이 필요 →
    // 카카오 앱을 비즈앱 전환 + 3개 동의항목 사용 설정해야 KOE205 없이 로그인됨.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setLoading(null);
      alert("로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
    // 성공 시 provider 페이지로 이동(리다이렉트) — 별도 처리 불필요.
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signIn("kakao")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] py-3 text-sm font-semibold text-[#191600] transition hover:brightness-95 disabled:opacity-60"
      >
        <KakaoIcon />
        {loading === "kakao" ? "이동 중…" : "카카오로 시작하기"}
      </button>

      <button
        type="button"
        onClick={() => signIn("google")}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white py-3 text-sm font-semibold text-ink transition hover:bg-zinc-50 disabled:opacity-60"
      >
        <GoogleIcon />
        {loading === "google" ? "이동 중…" : "Google로 시작하기"}
      </button>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.4.2-.1 2.6-1.8 3.6-2.5.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8S17.5 3 12 3Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
