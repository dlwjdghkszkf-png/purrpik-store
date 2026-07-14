"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * 헤더 로그인 상태 링크. 로그인 시 "내 계정", 아니면 "로그인".
 * 클라이언트에서 Supabase 세션 조회 + 상태 변화 구독.
 */
export function AccountLink() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthed(Boolean(data.user));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session?.user));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const href = authed ? "/account" : "/login";
  const label = authed ? "내 계정" : "로그인";

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center gap-1.5 p-1 text-ink transition-colors hover:text-brand-mustard"
    >
      <User className="h-6 w-6" />
      <span className="hidden text-sm font-medium md:inline">{label}</span>
    </Link>
  );
}
