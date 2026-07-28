import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// env trim — Vercel UI 붙여넣기 시 줄바꿈/공백 자동 제거.
const cleanEnv = (v: string | undefined) => (v ?? "").replace(/[\s\r\n]/g, "");

/**
 * 공개(비인증) 읽기 전용 Supabase 클라이언트.
 *
 * P1-1/P1-2 (REVIEW_SOL_QA_2026-07-28): products/reviews/faqs 같은 공개 데이터는
 * cookies()에 의존하는 세션 클라이언트를 쓰면 안 된다 — cookies() 호출이 라우트를
 * 강제로 dynamic 렌더링으로 만들어 매 요청 Supabase 순단에 노출된다.
 * 이 클라이언트는 쿠키를 읽지 않으므로 unstable_cache로 감싸 캐시할 수 있다.
 */
export function createPublicClient(): SupabaseClient<Database> {
  return createClient<Database>(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

/**
 * 네트워크/timeout/429/5xx 같은 일시 오류만 제한적으로 재시도한다.
 * RLS 거부·스키마 오류(PostgREST 4xx)는 재시도 없이 즉시 반환 — 지속 오류라 무의미.
 */
export async function queryWithRetry<T>(
  fn: () => PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>,
  attempts = 3,
): Promise<{ data: T | null; error: { message: string; code?: string } | null }> {
  let last: Awaited<ReturnType<typeof fn>> | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      last = await fn();
    } catch (e) {
      // transport 예외 — 재시도 대상.
      last = { data: null, error: { message: (e as Error).message } };
    }
    if (!last.error) return last;
    // PostgREST 오류 코드가 있으면(=서버가 응답함) 지속 오류로 보고 재시도 안 함.
    if (last.error.code) return last;
    if (i < attempts - 1) {
      const backoff = 120 * 2 ** i + Math.floor(Math.random() * 80);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  return last!;
}
