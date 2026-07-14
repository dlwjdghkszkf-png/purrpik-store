import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  isAdmin,
  adminEnabled,
  verifyPassword,
  setAdminCookie,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const pw = String(formData.get("password") ?? "");
  if (verifyPassword(pw)) {
    await setAdminCookie();
    redirect("/admin/orders");
  }
  redirect("/admin/login?e=1");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  if (await isAdmin()) redirect("/admin/orders");
  const { e } = await searchParams;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <h1 className="text-xl font-bold text-ink">관리자 로그인</h1>
        <p className="mt-1 text-small text-mute-1">주문·입금 관리</p>

        {!adminEnabled() && (
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
            ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. Vercel env에 추가 후
            사용하세요.
          </p>
        )}

        <form action={login} className="mt-6 space-y-3">
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="비밀번호"
            className="w-full rounded-md border border-line px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
          />
          {e && (
            <p className="text-xs text-red-600">비밀번호가 올바르지 않습니다.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-ink py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
