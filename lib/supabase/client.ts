import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// env trim — Vercel UI 붙여넣기 시 줄바꿈/공백 자동 제거 (HTTP header invalid 회피)
const cleanEnv = (v: string | undefined) => (v ?? "").replace(/[\s\r\n]/g, "");

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트.
 * anon key 사용 — RLS 정책에 따라 접근 제한.
 */
export function createClient() {
  return createBrowserClient<Database>(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
