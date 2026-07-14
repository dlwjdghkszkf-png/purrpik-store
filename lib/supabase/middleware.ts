import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Supabase base URL 정규화 (whitespace + 잘못 붙은 /rest/v1 방어).
const cleanUrl = (v: string | undefined) =>
  (v ?? "")
    .replace(/[\s\r\n]/g, "")
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "")
    .replace(/\/+$/, "");
const cleanKey = (v: string | undefined) => (v ?? "").replace(/[\s\r\n]/g, "");

/**
 * 미들웨어에서 Supabase 세션 쿠키를 갱신(refresh)한다.
 * access token 만료 시 자동 재발급 → 서버 컴포넌트에서 로그인 유지.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // 세션 갱신 (실패해도 요청은 통과)
  await supabase.auth.getUser();
  return response;
}
