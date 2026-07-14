import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export const metadata: Metadata = {
  title: "로그인 · 회원가입 — 푸르픽",
  description: "카카오·구글 계정으로 간편하게 로그인하세요.",
};
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next || "/account");

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-ink">
          로그인 · 회원가입
        </h1>
        <p className="mt-2 text-center text-small text-mute-1">
          별도 가입 없이 카카오·구글로 시작하세요.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-center text-xs text-red-600">
            로그인에 실패했습니다. 다시 시도해주세요.
          </p>
        )}

        <div className="mt-8">
          <SocialLoginButtons next={next} />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-mute-2">
          로그인 시 푸르픽{" "}
          <a href="/terms" className="underline hover:text-ink">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="underline hover:text-ink">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
