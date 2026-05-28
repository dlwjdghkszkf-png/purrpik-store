import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * RSC / Route Handler / Server Action용 Supabase 클라이언트.
 * anon key 사용 — RLS 정책에 따라 접근 제한.
 */
// env trim — Vercel UI 붙여넣기 시 줄바꿈/공백 자동 제거 (HTTP header invalid 회피)
const cleanEnv = (v: string | undefined) => (v ?? "").replace(/[\s\r\n]/g, "");

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // RSC에서는 cookie set 불가 — 무시 (middleware 또는 route handler에서만 동작)
          }
        },
      },
    }
  );
}

/**
 * Service role 클라이언트. RLS를 우회한다.
 * **서버 전용**. 클라이언트 컴포넌트나 브라우저에 노출하면 안 된다.
 * 사용처: orders/newsletter 등 server-only 테이블 쓰기, /api 라우트.
 */
export function createServiceClient() {
  return createServerClient<Database>(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
