import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "내 계정",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    (meta.nickname as string) ||
    (meta.user_name as string) ||
    "회원";
  const email = user.email ?? "-";
  const avatar =
    (meta.avatar_url as string) || (meta.picture as string) || null;
  const provider = user.app_metadata?.provider ?? "";
  const providerLabel =
    provider === "kakao"
      ? "카카오"
      : provider === "google"
        ? "Google"
        : provider;

  return (
    <div className="container-page max-w-lg py-16">
      <h1 className="text-2xl font-bold text-ink">내 계정</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-6">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-xl font-bold text-mute-1">
            {name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">{name}</p>
          <p className="truncate text-small text-mute-1">{email}</p>
          {providerLabel && (
            <p className="mt-0.5 text-[11px] text-mute-2">
              {providerLabel} 계정으로 로그인
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/orders/lookup"
          className="rounded-xl border border-line bg-white p-4 text-sm font-medium text-ink transition hover:border-ink"
        >
          주문 조회
          <p className="mt-1 text-xs font-normal text-mute-2">
            주문번호·연락처로 배송 상태 확인
          </p>
        </Link>
        <Link
          href="/shop"
          className="rounded-xl border border-line bg-white p-4 text-sm font-medium text-ink transition hover:border-ink"
        >
          쇼핑 계속하기
          <p className="mt-1 text-xs font-normal text-mute-2">
            전체 상품 보러가기
          </p>
        </Link>
      </div>

      <form action={logout} className="mt-8">
        <button className="text-small text-mute-1 underline underline-offset-4 hover:text-ink">
          로그아웃
        </button>
      </form>
    </div>
  );
}
