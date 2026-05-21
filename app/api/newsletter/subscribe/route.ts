/**
 * POST /api/newsletter/subscribe
 * Stage 12 — 뉴스레터 구독 (정보통신망법 마케팅 수신 동의 필수).
 *
 * 흐름:
 *   1) body { email, source?, consent } 검증
 *   2) 이메일 형식 + consent === true 강제
 *   3) Supabase service role으로 newsletter_subscribers INSERT
 *      - email UNIQUE 위반(23505)이면 alreadySubscribed: true 응답
 *   4) NEWSLETTER_DOUBLE_OPTIN === 'true'면 인증 메일 stub (P2)
 *
 * 보안: service role (RLS 우회) — 서버 전용. CSRF는 마케팅 동의 자체가 사용자 의사 표시이므로
 *       추가 토큰은 두지 않는다 (악성 봇 가입은 더블 옵트인으로 차단 예정).
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: unknown;
  source?: unknown;
  consent?: unknown;
}

export async function POST(req: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const source = typeof body.source === "string" ? body.source : "footer";
  const consent = body.consent === true;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400 }
    );
  }
  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "consent_required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: email.toLowerCase(),
    consent_at: new Date().toISOString(),
    source,
  });

  if (error) {
    // unique violation = 이미 가입
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    console.error("[newsletter.subscribe] db_error", error);
    return NextResponse.json(
      { ok: false, error: "db_error" },
      { status: 500 }
    );
  }

  // 더블 옵트인 (NEWSLETTER_DOUBLE_OPTIN=true면 이메일 발송 — Stage 14+/P2)
  if (process.env.NEWSLETTER_DOUBLE_OPTIN === "true") {
    // TODO: send verification email
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405 }
  );
}
